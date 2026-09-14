import { createAuthClient } from "better-auth/react";

export const {signIn, signUp, signOut, useSession} = createAuthClient({
    // pass client configuration 
    baseURL:process.env.BETTER_AUTH_URL,
})