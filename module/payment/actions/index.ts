"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { getRemainingLimit, updateUserTier } from "../lib/subscription";
import { polarClient } from "../config/polar";

export interface SubscriptionData {
  user: {
    id: string;
    name: string;
    email: string;
    subscriptionTier: string;
    subscriptionStatus: string | null;
    polarCustomerId: string | null;
    polarSubscriptionId: string | null;
  } | null;
  limits: {
    tier: "FREE" | "PRO";
    repositories: {
      current: number;
      limit: number | null;
      canAdd: boolean;
    };
    reviews: {
      [repositoryId: string]: {
        current: number;
        limit: number | null;
        canAdd: boolean;
      };
    };
  } | null;
}

export async function getSubscriptionData(): Promise<SubscriptionData> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { user: null, limits: null };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return { user: null, limits: null };
  }

  const limits = await getRemainingLimit(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionTier: user.subscriptionTier || "FREE",
      subscriptionStatus: user.subscriptionStatus || null,
      polarCustomerId: user.polarCustomerId || null,
      polarSubscriptionId: user.polarSubscriptionId || null,
    },
    limits,
  };
}

export async function syncSubscriptionStatus() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return { success: false, error: "Unauthenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    let polarCustomerId = user.polarCustomerId;

    //If polarCustomerId is missing in the db
    if (!polarCustomerId) {
      try {
        //Searching if the customer already exists in Polar by email or not
        const existingCustomers = await polarClient.customers.list({
          email: user.email,
        });
        const customerItem = existingCustomers.result.items[0];

        if (customerItem) {
          polarCustomerId = customerItem.id;
        } else {
          // if user don't exist in polar
          const newCustomer = await polarClient.customers.create({
            email: user.email,
            externalId: user.id,
            name: user.name || undefined,
          });
          polarCustomerId = newCustomer.id;
        }

        //Saving polarcustomer to the database
        await updateUserTier(user.id, "FREE", "EXPIRED", polarCustomerId);

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            polarCustomerId,
          },
        });
      } catch (polarError) {
        console.error("Failed to auto-provision Polar customer:", polarError);
        return {
          success: false,
          error: "Could not link or create Polar customer profile.",
        };
      }
    }

    // Fetch subscription from Polar
    const result = await polarClient.subscriptions.list({
      customerId: user.polarCustomerId,
    });
        // Depending on Polar SDK, items might be at result.items or result.result.items
    const subscriptions = result?.result?.items || [];

    const activeSub = subscriptions.find(
      (sub: any) => sub.status === "active" || sub.status === "trailing",
    );
    const latestSub = subscriptions[0];

    if (activeSub) {
      await updateUserTier(user.id, "PRO", "ACTIVE", activeSub.id);
      return { success: true, status: "ACTIVE" };
    } else if (latestSub) {
      const status = latestSub.status === "canceled" ? "CANCELLED" : "EXPIRED";
      if (latestSub.status !== "active") {
        await updateUserTier(user.id, "FREE", status, latestSub.id);
      }
      return { success: true, status: "NO_SUBSCRIPTION" };
    }

    return { success: true, status: "NO_SUBSCRIPTION" };
  } catch (error: any) {
        return {
      success: false,
      error: error?.message || "Failed to sync with Polar",
    };
  }
}
