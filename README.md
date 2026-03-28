# CommitDetective AI

An AI-powered developer tool that helps identify which commit likely introduced a bug. Paste a GitHub repository URL and an error message, and the system analyzes recent commits to pinpoint the culprit.

## Features

- **GitHub Integration**: Fetches commits and diffs via GitHub REST API
- **AI Analysis**: Uses OpenAI to correlate error messages with code changes
- **Persistent Storage**: Saves analyses to MongoDB for later reference
- **Authentication**: Sign in with GitHub or Google (NextAuth)
- **Analysis History**: View and revisit past analyses
- **Diff Preview**: Expand to see code changes for the suspected commit
- **Rate Limiting**: 10 analyses per minute per user
- **Access Control**: Users can only view their own analyses
- **Clean UI**: Modern developer-tool aesthetic (Vercel/Linear/GitHub inspired)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- MongoDB + Mongoose
- Tailwind CSS
- GitHub REST API

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in:

   ```env
   MONGODB_URI=mongodb://localhost:27017/commit-detective
   OPENAI_API_KEY=sk-your-openai-api-key
   GITHUB_TOKEN=ghp_your-github-token  # optional, for higher rate limits & private repos

   # Auth (NextAuth)
   NEXTAUTH_SECRET=your-random-secret  # e.g. openssl rand -base64 32
   NEXTAUTH_URL=http://localhost:3000
   GITHUB_ID=...      # from GitHub OAuth App
   ```

   **GitHub OAuth:** [Settings → Developer settings → OAuth Apps](https://github.com/settings/developers) → New OAuth App. Callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Paste a GitHub repository URL (e.g. `https://github.com/owner/repo`)
2. Paste your error message or stack trace
3. Optionally specify a branch (default: default branch)
4. Click **Analyze Bug**

The app fetches the last 10 commits, their diffs, and uses AI to predict which commit introduced the bug. Results include the suspected commit SHA, explanation, and suggested fix.

## Project Structure

```
/app
  page.tsx              # Home page
  results/page.tsx       # Results page
  layout.tsx
  globals.css
/lib
  github.ts              # GitHub API helpers
  ai.ts                  # OpenAI analysis
  db.ts                  # MongoDB connection
/models
  Analysis.ts            # Mongoose model
/app/api
  analyze/route.ts       # POST /api/analyze
  analysis/[id]/route.ts # GET /api/analysis/:id
/components
  RepoInputForm.tsx
  AnalysisResult.tsx
  CommitList.tsx
```

## License

MIT
