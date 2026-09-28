# CodeSentry 🤖

CodeSentry is an AI-powered code review tool for GitHub. Connect a repository, and CodeSentry automatically reviews every pull request using an LLM grounded in your codebase (via RAG), then posts the review as a PR comment — no manual triggering required.

## How it works

1. **Connect a repo** — Sign in with GitHub (OAuth), pick a repository from your account, and CodeSentry registers a webhook on it.
2. **Index the codebase** — An Inngest background job pulls the repo's files and embeds them into Pinecone for semantic retrieval.
3. **PR opened/updated** — GitHub sends a `pull_request` webhook event to CodeSentry.
4. **Review generated** — An Inngest function fetches the PR diff, retrieves relevant code context from Pinecone, and asks Gemini to generate a structured review (walkthrough, sequence diagram, issues, suggestions, etc.).
5. **Comment posted** — The review is posted back to the PR as a comment, and stored in the database.

Usage is metered per user (repositories connected, reviews per repository) with free vs. Pro tiers enforced through Polar-managed subscriptions.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling / UI | Tailwind CSS 4, shadcn/ui, Base UI |
| Auth | Better Auth (GitHub OAuth) |
| Database | PostgreSQL, Prisma 7 (`@prisma/adapter-pg`) |
| Background jobs | Inngest |
| AI | Vercel AI SDK + Google Gemini (`@ai-sdk/google`) |
| Vector search / RAG | Pinecone |
| GitHub integration | Octokit |
| Billing | Polar (`@polar-sh/better-auth`, `@polar-sh/sdk`) |

## Project structure

```
app/
  (auth)/          # Sign-in routes
  api/
    auth/[...all]/ # Better Auth handler
    inngest/       # Inngest function endpoint
    webhook/github/ # GitHub PR webhook receiver
  dashboard/        # Authenticated app UI
module/
  ai/               # RAG (Pinecone) + review-generation entry point
  auth/             # Auth UI/actions
  dashboard/        # Dashboard data/UI
  github/           # Octokit wrappers (webhooks, PR diff, file contents)
  payment/          # Polar config + subscription/usage limits
  repository/       # Connect/list repositories
  review/           # Review UI
  settings/         # Settings UI
inngest/
  function/
    index.ts         # indexRepo — embeds a connected repo into Pinecone
    review.ts         # generateReview — fetches diff, retrieves context, calls Gemini, posts comment
prisma/
  schema.prisma      # User, Repository, Review, UserUsage, Session, Account, Verification
lib/                  # Prisma client, Better Auth client, Pinecone client, utils
```

## Prerequisites

- Node.js 20+
- A PostgreSQL database
- A [GitHub OAuth App](https://github.com/settings/developers) (with `repo` scope)
- A [Pinecone](https://www.pinecone.io/) index named `ai-code-reviewer` (768 dimensions, cosine metric, to match `gemini-embedding-001` at `outputDimensionality: 768`)
- A Google AI Studio API key for Gemini
- A [Polar](https://polar.sh) sandbox account + product (for subscriptions)
- [ngrok](https://ngrok.com/) or a similar tunnel, so GitHub can deliver webhooks to your local machine during development

## Environment variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codesentry"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth App
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# Public app URL (used to build the webhook callback URL)
NEXT_PUBLIC_APP_BASE_URL="https://your-ngrok-subdomain.ngrok-free.dev"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Gemini (Vercel AI SDK reads this automatically)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Pinecone
PINECONE_DB_API_KEY="your-pinecone-api-key"

# Polar (billing)
POLAR_ACCESS_TOKEN="your-polar-sandbox-access-token"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"
POLAR_SUCCESS_URL="/dashboard/subscription?success=true"
```

> `NEXT_PUBLIC_APP_BASE_URL` must be a URL GitHub can reach — this is where PR webhooks are delivered, so it needs to be a tunnel URL (or your production domain), not `localhost`.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Generate the Prisma client and apply migrations
npx prisma generate
npx prisma migrate dev

# 3. Run the Next.js dev server
npm run dev

# 4. In a separate terminal, run the Inngest dev server
npx inngest-cli dev

# 5. In a separate terminal, expose your local server for GitHub webhooks
ngrok http 3000
```

Then open [http://localhost:3000](http://localhost:3000), sign in with GitHub, and connect a repository from the dashboard.

## Database schema

- **User** — profile + subscription tier/status/Polar customer ID
- **Repository** — a connected GitHub repo, owned by a user
- **Review** — one review per PR event, linked to a repository
- **UserUsage** — tracks repository count and per-repository review counts for tier limits
- **Session / Account / Verification** — Better Auth tables

## Known limitations

- Review generation runs on every `opened`/`synchronize` PR event — there's no debouncing, so rapid force-pushes can trigger overlapping reviews for the same PR.
- The GitHub webhook endpoint does not currently verify the `X-Hub-Signature-256` header.
- Free tier is capped at 5 repositories and 5 reviews per repository; Pro is unlimited (enforced via `module/payment/lib/subscription.ts`).

## License

See [LICENSE.md](./LICENSE.md).