import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { indexRepo } from "@/inngest/function";
import { generateReview } from "@/inngest/function/review";
import { reviewPullRequest } from "@/module/ai/actions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    indexRepo,
    reviewPullRequest,
    generateReview
    ],
});
