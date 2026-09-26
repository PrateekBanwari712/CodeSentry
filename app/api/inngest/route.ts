import {serve} from "inngest/next";
import {inngest } from "@/inngest/client";
import { indexRepo } from "@/inngest/function";
import { generateReview } from "@/inngest/function/review";

export const {GET, POST, PUT} = serve({
    client: inngest,
    functions: [indexRepo,
        generateReview
    ],
})