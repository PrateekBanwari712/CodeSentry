import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { getRepoKey } from "@/lib/repo";
import { getPullRequestDiff } from "@/module/github/lib/github";
import {
  canCreateReview,
  incrementReviewCount,
} from "@/module/payment/lib/subscription";
import { retrieverContext } from "../lib/rag";
import { NonRetriableError } from "inngest";

export const reviewPullRequest = inngest.createFunction(
  {
    id: "review-pull-request",
    triggers: { event: "pr.review.requested" },
    retries: 2,

    //Runs once, after all retires are used up
    onFailure: async ({ event, error }) => {
      const { owner, repo, prNumber } = event.data.event.data;

      const repository = await prisma.repository.findFirst({
        where: { owner, name: repo },
      });

      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: "Failed to fetch PR",
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            Review: `Error: ${error.message}`,
            status: "failed",
          },
        });
      }
    },
  },
  async ({ event, step }) => {
    const { owner, repo, prNumber } = event.data;
    //1.fetching repositories
    const repository = await step.run("get-repository", async () => {
      return await prisma.repository.findFirst({
        where: {
          owner,
          name: repo,
        },
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  providerId: "github",
                },
              },
            },
          },
        },
      });
    });

    if (!repository) {
      throw new NonRetriableError(
        `Repository ${owner}/${repo} not found in database. Please reconnect the repository.`,
      );
    }

    //2.checking limit
    const canReview = await step.run("check-limits", async () => {
      return await canCreateReview(repository.user.id, repository.id);
    });

    if (!canReview) {
      throw new NonRetriableError("Review limit reached for this repository.");
    }

    //3.Getting Github token & fetch diff
    const githubAccount = repository.user.accounts[0];
    if (!githubAccount) {
      throw new NonRetriableError("No Github access token found");
    }

    const { title, description } = await step.run(
      "fetch-pr-details",
      async () => {
        const token = githubAccount.accessToken!;
        return await getPullRequestDiff(token, owner, repo, prNumber);
      },
    );

    // 4.Retrieve RAG context using shared repoKey helper
    const context = await step.run("retrieve-rag-context", async () => {
      const query = [title, description].filter(Boolean).join("\n");
      const repoKey = getRepoKey(owner, repo);
      return await retrieverContext(query, repoKey);
    });

    //5. AI code review generation
    await step.run("trigger-generation-event", async () => {
      await inngest.send({
        name: "pr.review.generation.requested",
        data: {
          owner,
          repo,
          prNumber,
          userId: repository.user.id,
          context,
        },
      });
    });

    //6.Increment usage count safely
    await step.run("increment-usage", async () => {
      await incrementReviewCount(repository.user.id, repository.id);
    });

    return { success: true, message: "review Queued" };
  },
);
