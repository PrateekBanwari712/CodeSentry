import { polarClient } from "@polar-sh/better-auth/client";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, checkout, customer } =
  createAuthClient({
    // pass client configuration
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [polarClient()],
  });
