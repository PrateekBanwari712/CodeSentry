import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
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
    return response?.user?.contributionCollection?.contributionCalendar;
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return null;
  }
};
