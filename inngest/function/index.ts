import prisma from "@/lib/db";
import { inngest } from "../client";
import { getRepoFileContents } from "@/module/github/lib/github";
import { indexCodebase } from "@/module/ai/lib/rag";
import { getRepoKey } from "@/lib/repo";

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    triggers: { event: "repository.connected" },
  },

  async ({ event, step }) => {
    const {owner, repo, userId} = event.data;

    //fetching all the files from a specific repo
    const files = await step.run("fetch-files", async() => {
        const account = await prisma.account.findFirst({
            where: {
                userId: userId,
                providerId: "github",
            },
        })

        if(!account?.accessToken) {
            throw new Error("No Github access token found")
        }
        return await getRepoFileContents(account.accessToken, owner, repo)
    })

    // indexing the code data - pineCone RAG
    await step.run("index-codebase", async () => {
        const repoKey = getRepoKey(owner, repo);
        await indexCodebase(repoKey, files)
    })

    return {success: true, indexedFiles:files.lastIndexOf}
  },

);
