# CodeSentry 🤖

**AI-powered code review for GitHub repositories.**

CodeSentry automatically reviews Pull Requests using **Gemini + RAG**, grounding each review in the existing codebase. Connect a GitHub repository, open a Pull Request, and CodeSentry analyzes the changes and posts an AI-generated review directly to the PR.

## ✨ Features

* 🔐 **GitHub OAuth** — Secure authentication with GitHub
* 🔗 **Repository Integration** — Connect repositories directly from the dashboard
* 🪝 **GitHub Webhooks** — Automatically detect new and updated Pull Requests
* 🧠 **AI Code Review** — Analyze PR changes using Google Gemini
* 🔍 **RAG-powered Context** — Retrieve relevant code from the repository using Pinecone
* ⚡ **Background Processing** — Process repository indexing and reviews asynchronously with Inngest
* 💬 **Automatic PR Comments** — Post generated reviews directly to GitHub Pull Requests
* 📊 **Review History** — Store generated reviews and repository information
* 💳 **Subscription System** — Free and Pro tiers using Polar
* 🎨 **Modern Dashboard** — Built with Next.js, Tailwind CSS and shadcn/ui

---

## 🚀 How It Works

```text
┌─────────────────────┐
│   GitHub Repository │
└──────────┬──────────┘
           │
           │ Connect repository
           ▼
┌─────────────────────┐
│      CodeSentry     │
│    GitHub OAuth     │
└──────────┬──────────┘
           │
           │ Index repository
           ▼
┌─────────────────────┐
│       Inngest       │
│  Background Worker  │
└──────────┬──────────┘
           │
           │ Generate embeddings
           ▼
┌─────────────────────┐
│      Pinecone       │
│   Vector Database   │
└──────────┬──────────┘
           │
           │ Pull Request
           ▼
┌─────────────────────┐
│   GitHub Webhook    │
└──────────┬──────────┘
           │
           │ PR diff + relevant context
           ▼
┌─────────────────────┐
│     Google Gemini   │
│     AI Code Review  │
└──────────┬──────────┘
           │
           │ Generated review
           ▼
┌─────────────────────┐
│   GitHub PR Comment │
└─────────────────────┘
```

### Review Flow

1. Sign in with GitHub.
2. Connect a repository.
3. CodeSentry indexes the repository and stores embeddings in Pinecone.
4. A Pull Request is opened or updated.
5. GitHub sends a webhook event to CodeSentry.
6. The webhook is authenticated using `X-Hub-Signature-256`.
7. Inngest processes the review in the background.
8. CodeSentry fetches the Pull Request diff.
9. Relevant code context is retrieved from Pinecone.
10. Gemini analyzes the changes using the retrieved context.
11. The generated review is posted back to the Pull Request.
12. The review is stored in the CodeSentry database.

---

## 🛠 Tech Stack

| Category        | Technology                    |
| --------------- | ----------------------------- |
| Framework       | Next.js 16                    |
| Frontend        | React 19, TypeScript          |
| Styling         | Tailwind CSS 4                |
| UI Components   | shadcn/ui, Base UI            |
| Authentication  | Better Auth + GitHub OAuth    |
| Database        | PostgreSQL                    |
| ORM             | Prisma 7                      |
| Background Jobs | Inngest                       |
| AI              | Google Gemini + Vercel AI SDK |
| RAG             | Pinecone                      |
| GitHub API      | Octokit                       |
| Payments        | Polar                         |
| Deployment      | Vercel                        |

---

## 🏗 Project Structure

```text
CodeSentry/
│
├── app/
│   ├── (auth)/                  # Authentication pages
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth API
│   │   ├── inngest/             # Inngest endpoint
│   │   └── webhooks/
│   │       └── github/          # GitHub webhook receiver
│   │
│   └── dashboard/               # Main application dashboard
│
├── module/
│   ├── ai/                      # AI + RAG functionality
│   ├── auth/                    # Authentication UI/actions
│   ├── dashboard/               # Dashboard functionality
│   ├── github/                  # GitHub API integration
│   ├── payment/                 # Polar subscriptions
│   ├── repository/              # Repository management
│   ├── review/                  # Review functionality
│   └── settings/                # User settings
│
├── inngest/
│   └── function/
│       ├── index.ts             # Repository indexing
│       └── review.ts            # PR review generation
│
├── prisma/
│   └── schema.prisma            # Database schema
│
└── lib/
    ├── auth.ts                  # Better Auth configuration
    ├── db.ts                    # Prisma client
    └── ...
```

---

## ⚙️ Getting Started

### Prerequisites

Before running CodeSentry locally, you'll need:

* Node.js 20+
* PostgreSQL database
* GitHub OAuth application
* Google Gemini API key
* Pinecone account and index
* Inngest
* Polar account if you want to test subscriptions
* ngrok or another tunneling service for local GitHub webhooks

### 1. Clone the repository

```bash
git clone https://github.com/PrateekBanwari712/CodeSentry.git

cd CodeSentry
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codesentry"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-better-auth-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# GitHub Webhook
GITHUB_WEBHOOK_SECRET="your-github-webhook-secret"

# Public application URL
APP_BASE_URL="https://your-ngrok-url"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Pinecone
PINECONE_DB_API_KEY="your-pinecone-api-key"

# Polar
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"
POLAR_SUCCESS_URL="/dashboard/subscription?success=true"
```

> Never commit your `.env` file or expose secrets through `NEXT_PUBLIC_*` variables.

### 4. Set up Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start the Next.js application

```bash
npm run dev
```

### 6. Start the Inngest development server

In another terminal:

```bash
npx inngest-cli dev
```

### 7. Expose the application for GitHub webhooks

For local development:

```bash
ngrok http 3000
```

Use the generated public URL as:

```env
APP_BASE_URL="https://your-ngrok-url"
```

Then open:

```text
http://localhost:3000
```

and connect your GitHub repository.

---

## 🔐 GitHub Webhook Security

CodeSentry validates GitHub webhook requests using the `X-Hub-Signature-256` header.

The webhook secret is configured using:

```env
GITHUB_WEBHOOK_SECRET="your-secret"
```

GitHub signs webhook payloads using this secret, and CodeSentry verifies the signature before processing the event.

The webhook endpoint is:

```text
/api/webhooks/github
```

This prevents arbitrary requests from being treated as legitimate GitHub events.

---

## ☁️ Vercel Deployment

CodeSentry can be deployed to Vercel.

### Required production configuration

Add the required environment variables to your Vercel project:

```text
DATABASE_URL
BETTER_AUTH_URL
BETTER_AUTH_SECRET

GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_WEBHOOK_SECRET

APP_BASE_URL
NEXT_PUBLIC_APP_URL

GOOGLE_GENERATIVE_AI_API_KEY

PINECONE_DB_API_KEY

INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY

POLAR_ACCESS_TOKEN
POLAR_WEBHOOK_SECRET
POLAR_SUCCESS_URL
```

For production, update:

```env
BETTER_AUTH_URL="https://your-domain.vercel.app"
APP_BASE_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

After deployment, configure the GitHub OAuth application's callback URL to use the production CodeSentry domain.

Inngest should also be configured to use the deployed:

```text
https://your-domain.vercel.app/api/inngest
```

endpoint.

---

## 🧠 RAG Architecture

CodeSentry uses Retrieval-Augmented Generation to provide Gemini with relevant context from the existing codebase.

```text
Repository Files
       │
       ▼
 File Extraction
       │
       ▼
   Embeddings
       │
       ▼
    Pinecone
       │
       │
       │ Pull Request
       ▼
   PR Diff
       │
       ▼
Semantic Retrieval
       │
       ▼
Relevant Code Context
       │
       ▼
    Gemini
       │
       ▼
  Code Review
```

This allows the model to analyze a Pull Request in the context of the existing repository rather than relying only on the changed lines.

---

## 📊 Database

The application uses PostgreSQL with Prisma.

Main models include:

* **User** — User profile and subscription information
* **Repository** — Connected GitHub repositories
* **Review** — Generated Pull Request reviews
* **UserUsage** — Usage tracking for subscription limits
* **Session** — Better Auth sessions
* **Account** — OAuth provider accounts
* **Verification** — Authentication verification data

---

## 🔮 Future Improvements

Some planned improvements include:

* [ ] Inline GitHub review comments
* [ ] Review severity classification
* [ ] More detailed file and line-level suggestions
* [ ] Review deduplication for rapid PR updates
* [ ] Repository indexing progress indicators
* [ ] Improved review history and analytics
* [ ] More configurable AI review rules
* [ ] Support for additional AI providers
* [ ] Improved repository filtering and indexing
* [ ] Advanced usage and cost monitoring

---

## 📌 Known Limitations

* Rapid updates to the same Pull Request can trigger multiple review jobs.
* Large repositories may require longer indexing and processing times.
* AI-generated reviews can occasionally contain incorrect or incomplete suggestions.
* Free-tier usage limits are enforced through the subscription system.

---

## 🎯 Why CodeSentry?

CodeSentry was built to explore how modern AI applications can combine:

```text
LLMs
+
RAG
+
Vector Databases
+
GitHub APIs
+
Webhooks
+
Background Jobs
+
PostgreSQL
+
SaaS Authentication
+
Subscriptions
```

The project demonstrates an end-to-end workflow where an AI system interacts with a real software development workflow rather than functioning only as a standalone chatbot.

---

## 📄 License

See `LICENSE.md` for license information.

```

### A couple of changes I deliberately made

- **Removed the old limitation saying webhook signatures weren't verified**, because you've now implemented that.
- Changed the route documentation from `/api/webhook/github` to your actual **`/api/webhooks/github`**.
- Added the **Vercel deployment section**, since that's now an important part of the project.
- Added a clear **architecture diagram**. This is particularly useful for a recruiter because they can understand the project without reading your source code.
- Kept the limitations realistic instead of presenting CodeSentry as an enterprise-ready product.
- Added the **"Why CodeSentry?"** section to make the technical breadth of the project immediately visible.

One thing I'd change after you deploy: put a **Live Demo** section right below the opening description, with the Vercel URL and 2–3 screenshots/GIFs. For a resume project, that will probably do more for the README than adding more technical documentation.
```
