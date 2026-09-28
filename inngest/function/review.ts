import { inngest } from "../client";
import {
  getPullRequestDiff,
  postReviewComment,
} from "@/module/github/lib/github";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import prisma from "@/lib/db";

export const generateReview = inngest.createFunction(
  {
    id: "generate-pr-review",
    concurrency: 5,
    triggers: { event: "pr.review.generation.requested" },
  },

  async ({ event, step }) => {
    const { owner, repo, prNumber, userId, context } = event.data;

    const { diff, title, description, token } = await step.run(
      "fetch-pr-data",
      async () => {
        const account = await prisma.account.findFirst({
          where: {
            userId: userId,
            providerId: "github",
          },
        });
        if (!account?.accessToken) {
          throw new Error("No Github access token found");
        }

        const data = await getPullRequestDiff(
          account.accessToken,
          owner,
          repo,
          prNumber,
        );
        return { ...data, token: account.accessToken };
      },
    );

    const review = await step.run("generate-ai-review", async () => {
      const prompt = `You are an expert code reviewer. Analyze the following pull request and provide a detailed, constructive code review.

PR Title: ${title}
PR Description: ${description || "No description provided"}

Context from Codebase:
${context.join("\n\n")}

Code Changes:
\`\`\`diff
${diff}
\`\`\`

Please provide:
{
  summary: "...",
  walkthrough: [],
  issues: [
    {
      severity: "high",
      file: "...",
      line: 42,
      explanation: "...",
      suggestion: "..."
    }
  ],
  strengths: [],
  architecture: "..."
}

Format your response in markdown.`;

      const { text } = await generateText({
        model: google("gemini-3.8-flash"),
        prompt,
      });

      return text;
    });

    await step.run("post-comment", async () => {
      await postReviewComment(token, owner, repo, prNumber, review);
    });

    await step.run("save-review", async () => {
      const repository = await prisma.repository.findFirst({
        where: {
          owner,
          name: repo,
        },
      });

      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: title,
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            Review: review,
            status: "completed",
          },
        });
      }
    });
  },
);
