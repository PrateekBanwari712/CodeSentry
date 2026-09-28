import { inngest } from "@/inngest/client";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifyGitHubSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function POST(req: NextRequest) {
  try {
    
    const signature = req.headers.get("x-hub-signature-256");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing GitHub signature" },
        { status: 401 },
      );
    }

    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      console.error("GITHUB_WEBHOOK_SECRET is not configured");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const rawBody = await req.text();

    const isValid = verifyGitHubSignature(
      rawBody,
      signature,
      secret,
    );

    if (!isValid) {
      console.warn("Invalid GitHub webhook signature");

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const body = JSON.parse(rawBody);

    const event = req.headers.get("x-github-event");

    console.log(`Received GitHub event: ${event}`);

    if (event === "ping") {
      return NextResponse.json(
        { message: "Pong" },
        { status: 200 },
      );
    }

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

        if (!owner || !repoName) {
          return NextResponse.json(
            { error: "Invalid repository name" },
            { status: 400 },
          );
        }

        await inngest.send({
          name: "pr.review.requested",
          data: {
            owner,
            repo: repoName,
            prNumber,
          },
        });

        console.log(
          `Queued PR review for ${owner}/${repoName}#${prNumber}`,
        );
      }
    }

    return NextResponse.json(
      { message: "Event processed" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing GitHub webhook:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
