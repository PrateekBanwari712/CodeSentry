"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const headersRequest = await headers();

  const session = await auth.api.getSession({
    headers: headersRequest,
  });

  if (!session) {
    redirect("/login");
  }
  return session;
};
export const requireUnAuth = async () => {
  const headersRequest = await headers();

  const session = await auth.api.getSession({
    headers: headersRequest,
  });

  if (session) {
    redirect("/");
  }
  return session;
};
