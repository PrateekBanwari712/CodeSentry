import { inngest } from "@/inngest/client";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");

    if (event === "ping") {
      return NextResponse.json({ message: "Pong" }, { status: 200 });
    }
    console.log(`Recieved Github event ${event}`);

    if (event === "pull_request") {
      const action = body.action;
      const repoFullName = body.repository?.full_name;
      const prNumber = body.pull_request?.number;

      if (
        (action === "opened" || action === "synchronize") &&
        repoFullName &&
        prNumber
      ) {
        const [owner, repoName] = repoFullName.split("/");

        await inngest.send({
          name: "pr.review.requested",
          data: {
            owner,
            repo: repoName,
            prNumber,
          },
        });
      }
    }

    return NextResponse.json({ message: "Event Processes" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
