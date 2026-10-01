"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { mapConcurrently, shouldIgnoreFile } from "@/lib/github-filter";
import { headers } from "next/headers";
import { Octokit } from "octokit";

export const getGithubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });
  if (!account) {
    throw new Error("No github access token found");
  }

  return account.accessToken;
};

export const fetchUserContribution = async (
  token: string | null,
  userName: string,
) => {
  const octokit = new Octokit({ auth: token });

  const query = `
   query($userName: String!){
        user(login: $userName){
            contributionsCollection {
                contributionCalendar{
                   totalContributions
                   weeks{
                       contributionDays{
                           contributionCount
                           date
                           color
                       }
                   }
                }
                
            }  
        }
   }
   `;

  try {
    const response: any = await octokit.graphql(query, {
      userName,
    });
    return response?.user?.contributionsCollection?.contributionCalendar;
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return null;
  }
};

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page,
  });

  return data;
};

export const createWebhook = async (owner: string, repo: string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const webhookUrl = `${process.env.APP_BASE_URL}/api/webhooks/github`;

  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  const existingHook = hooks.find((hook) => hook.config.url === webhookUrl);

  if (existingHook) {
    return existingHook;
  }

  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: "json",
      secret:process.env.GITHUB_WEBHOOK_SECRET
    },
    events: ["pull_request"],
  });

  return data;
};

export const deleteWebhook = async (owner: string, repo: string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });
  const webhookUrl = `${process.env.APP_BASE_URL}/api/webhooks/github`;

  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const hookToDelete = hooks.find((hook) => hook.config.url === webhookUrl);

    if (hookToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hookToDelete.id,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return false;
  }
};

export const getRepoFileContents = async (
  token: string,
  owner: string,
  repo: string,
  path: string = "",
): Promise<{ path: string; content: string }[]> => {
  const octokit = new Octokit({ auth: token });

  if (path && path !== "") {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
    if (!Array.isArray(data) && data.type === "file" && data.content) {
      return [
        {
          path: data.path,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
        },
      ];
    }
  }

  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch || "main";

    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: "1",
    });

    const filesToFetch = treeData.tree.filter(
      (item: any) => item.type === "blob" && !shouldIgnoreFile(item.path),
    );

    const files = await mapConcurrently(
      filesToFetch,
      10,
      async (fileItem: any) => {
        try {
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: fileItem.path,
          });

          if (
            !Array.isArray(fileData) &&
            fileData.type === "file" &&
            fileData.content
          ) {
            return {
              path: fileItem.path,
              content: Buffer.from(fileData.content, "base64").toString(
                "utf-8",
              ),
            };
          }
        } catch (error) {
          console.error(`Error fetching content for ${fileItem.path}:`, error);
        }
        return null;
      },
    );

    return files.filter(Boolean) as { path: string; content: string }[];
  } catch (error) {
    console.error("Failed to fetch repository tree via Git API:", error);
    return [];
  }
};

export const getPullRequestDiff = async (
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
) => {
  const octokit = new Octokit({ auth: token });

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: "diff",
    },
  });

  return {
    diff: diff as unknown as string,
    title: pr.title,
    description: pr.body || "",
  };
};

export async function postReviewComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  review: string,
) {
  const octokit = new Octokit({ auth: token });

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `## 🤖 Code-Sentry \n\n ${review}\n\n---\n *Your Ai code review generator*`,
  });
}
