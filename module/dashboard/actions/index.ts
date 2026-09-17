"use server"

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { fetchUserContribution, getGithubToken } from "@/module/github/lib/github";
import { headers } from "next/headers";
import {Octokit} from "octokit";


export const getDashboardStats= async() => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if(!session) {
            throw new Error("Unauthorized")
        }

        const token = await getGithubToken();
        const octokit = new Octokit({auth: token});

        // Fetching users github username

        const {data : user} = await octokit.rest.users.getAuthenticated()

        // Fetching Repo data from db;

        const totalRepos = 30;
        const totalCommits = 14;

        const {data: prs} = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr`,
            per_page: 1,
        })

        const totalPRs = prs.total_count;

        // fetching AI Reviews from DB

        const totalReviews = 44;

        return {
            totalCommits,
            totalPRs,
            totalRepos,
            totalReviews
        }
        
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return {
            totalCommits: 0,
            totalPRs: 0,
            totalReviews: 0,
            totalRepos: 0,
        }
    }
} 

export const getContributionStats = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        if(!session) {
            throw new Error("Unauthorized")
        }

        const token = await getGithubToken();
        const octokit = new Octokit({auth: token})

        // fetching user from github
        
        const {data : user} = await octokit.rest.users.getAuthenticated();

        const userName = user.login;

        const calendar = await fetchUserContribution(token, userName)

        if(!calendar) {
            throw new Error("no Calender")
            return null
        }

        const contributions = calendar.weeks.flatMap((week: any) => 
        week.contributionDays.map((day : any) => ({
            date: day.date,
            count: day.contributionCount,
            level: Math.min(4, Math.floor(day.contributionCount / 3)),
        })))

		return {
            contributions,
            totalContributions: calendar.totalContributions,
        }

    } catch (error) {
        
    }
}

export const getMonthlyActivity = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if(!session){
            throw new Error("Unauthorized")
        }

        const token = await getGithubToken();
        const octokit = new Octokit({auth: token});
        const {data :  user} = await octokit.rest.users.getAuthenticated();

        const calendar = await fetchUserContribution(token, user.login);

        if(!calendar) {
            return [];
        }

        const monthlyData : {
            [key: string] : {commits: number, prs: number, reviews: number} 
        } = {};

        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun", 
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov", 
            "Dec"
        ];

		const now = new Date();
		for(let i = 5; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthKey = monthNames[date.getMonth()]
			monthlyData[monthKey] = {commits: 0, prs: 0, reviews: 0}
		}

		calendar.weeks.forEach((week: any) => {
			week.contributionDays.forEach((day : any) => {
				const date = new Date(day.date);
				const monthKey = monthNames[date.getMonth()]
				if(monthlyData[monthKey]) {
					monthlyData[monthKey].commits += day.contributionCount
				}
			})
		})

		//Fetch reviews from database for last 6 months
		const sixMonthsAgo = new Date()
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

		//TODO: fetch real review data
		const generateSampleReviews = () => {
			const sampleReviews = []
			const now = new Date()

			// Generate random reviews over the past 6 months
			for(let i = 0 ; i < 45; i++){
				// Random days in the last 6 months
				const randomDaysAgo = Math.floor(Math.random() * 100)
				const reviewDate = new Date(now)
				reviewDate.setDate(reviewDate.getDate() - randomDaysAgo)

				sampleReviews.push({
					createdAt: reviewDate,
				})
			}
			return sampleReviews
		}

		const reviews = generateSampleReviews()

		reviews.forEach((review) =>{
			const monthKey = monthNames[review.createdAt.getMonth()]
			if(monthlyData[monthKey]) {
				monthlyData[monthKey].reviews += 1
			}
		})

		const {data : prs } =  await octokit.rest.search.issuesAndPullRequests({
			q: `author:${user.login} type:pr create:>${sixMonthsAgo.toISOString().split("T")[0]
			}`,
			per_page: 100,
		})

		prs.items.forEach((pr: any) => {
			const date = new Date(pr.created_at)
			const monthKey = monthNames[date.getMonth()]
			if(monthlyData[monthKey]) {
				monthlyData[monthKey].prs += 1
			}
		})

		return Object.keys(monthlyData).map((name) => ({
			name,
			...monthlyData[name],
		}))

    } catch (error) {
        console.log("Error fetching monthly activity:", error);
        return []
    }
}