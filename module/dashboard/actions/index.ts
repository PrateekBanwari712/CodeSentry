"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  fetchUserContribution,
  getGithubToken,
} from "@/module/github/lib/github";
import { getReviews } from "@/module/review/actions";
import { headers } from "next/headers";
import { Octokit } from "octokit";

interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export const getDashboardStats = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    // Fetching users github username

    const { data: user } = await octokit.rest.users.getAuthenticated();

    const userRepos = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
    });

    const totalRepos = userRepos.length;

    const calendar = await fetchUserContribution(token, user.login);
    const totalCommits = calendar?.totalContributions || 0;

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr`,
      per_page: 1,
    });

    const totalPRs = prs.total_count;

    const totalReviews = await getReviews.length;

    return {
      totalCommits,
      totalPRs,
      totalRepos,
      totalReviews,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalCommits: 0,
      totalPRs: 0,
      totalReviews: 0,
      totalRepos: 0,
    };
  }
};

export const getContributionStats = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    // fetching user from github

    const { data: user } = await octokit.rest.users.getAuthenticated();

    const userName = user.login;

    const calendar = await fetchUserContribution(token, userName);

    if (!calendar) {
      return {contributions: [], totalContributions: 0};
    }

    const levelMap: Record<string, number> = {
      NONE: 0,
      FIRST_QUARTILE: 1,
      SECOND_QUARTILE: 2,
      THIRD_QUARTILE: 3,
      FOURTH_QUARTILE: 4,
    };

    const contributions = calendar.weeks.flatMap((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
       level: levelMap[day.contributionLevel] ?? Math.min(4, Math.floor(day.contributionCount / 3)),
      })),
    );

    return {
      contributions,
      totalContributions: calendar.totalContributions,
    };
  } catch (error) {
    console.error("Error fetching contribution stats:", error);
    return null;
  }
};

export const getMonthlyActivity = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    const calendar = await fetchUserContribution(token, user.login);

    if (!calendar) {
      return [];
    }

    const monthlyData: {
      [key: string]: { commits: number; prs: number; reviews: number };
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
      "Dec",
    ];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 };
    }

    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].commits += day.contributionCount;
        }
      });
    });

    //Fetch reviews from database for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const reviews = await getReviews();

    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].reviews += 1;
      }
    });

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr created:>${
        sixMonthsAgo.toISOString().split("T")[0]
      }`,
      sort: 'created',
      per_page: 100,
    });

    prs.items.forEach((pr: any) => {
      const date = new Date(pr.created_at);
      const monthKey = monthNames[date.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].prs += 1;
      }
    });

    return Object.keys(monthlyData).map((name) => ({
      name,
      ...monthlyData[name],
    }));
  } catch (error) {
    console.log("Error fetching monthly activity:", error);
    return [];
  }
};
