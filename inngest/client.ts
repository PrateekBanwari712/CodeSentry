import {Inngest} from "inngest";

export const inngest = new Inngest({id:"Code-Sentry", isDev: process.env.NODE_ENV === "development",});