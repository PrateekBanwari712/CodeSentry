"use server"

import { inngest } from "@/inngest/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { createWebhook, getRepositories } from "@/module/github/lib/github"
import { headers } from "next/headers"


export const fetchRepositories = async (page: number=1, per_page:number = 10) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        throw new Error("Unauthorized")
    }

    const githubRepos = await getRepositories(page, per_page);

    const dbRepos = await prisma.repository.findMany({
        where: {
            userId: session.user.id,
        }
    })

    const connectedReposId = new Set(dbRepos.map((repo) => repo.githubId));

    return githubRepos.map((repo : any) => ({
        ...repo,
        isConnected: connectedReposId.has(BigInt(repo.id)),
    }))
}

export const connectRepositories = async (
    owner: string,
    repo: string,
    githubId: number
) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session) {
        throw new Error("Unauthorized")
    }

    // TODO: check if more repos can be connected or not 

    const webhook = await createWebhook(owner, repo);

    if(!webhook){
        throw new Error("Failed to create Github webhook");
    }

    if(webhook) {
        await prisma.repository.create({
            data: {
                githubId: BigInt(githubId),
                name: repo,
                owner,
                fullName: `${owner}/${repo}`,
                url: `https://github.com/${owner}/${repo}`,
                userId: session.user.id,
            },
        })
    }

    // TODO: TRIGGER REPOSITORY INDEXING FOR RAG (FIRE AND FORGET)

    try {
        await inngest.send({
            name: "repository.connected",
            data: {
                owner,
                repo,
                userId: session.user.id,
            }
        })
    } catch (error) {
        console.error("Failed to trigger repository indexing:", error)
    }

    return webhook;
}