import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Analysis from "@/models/Analysis";
import {
  parseRepoUrl,
  getRepoCommits,
  getCommitDetails,
  getFileContents,
} from "@/lib/github";
import { analyzeBug, RelevantCodeRef } from "@/lib/ai";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";
import { parseStackTrace, extractLines } from "@/lib/stacktrace";

const MAX_ERROR_MESSAGE_LENGTH = 50 * 1024;
const MAX_REPO_URL_LENGTH = 500;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, remaining } = checkRateLimit(session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    const body = await request.json();
    const { repoUrl, errorMessage, branch, githubToken } = body;

    if (!repoUrl || !errorMessage) {
      return NextResponse.json(
        { error: "repoUrl and errorMessage are required" },
        { status: 400 }
      );
    }

    if (typeof repoUrl !== "string" || repoUrl.length > MAX_REPO_URL_LENGTH) {
      return NextResponse.json(
        { error: "Repository URL is too long" },
        { status: 400 }
      );
    }

    if (typeof errorMessage !== "string" || errorMessage.length > MAX_ERROR_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "Error message is too long (max 50KB)" },
        { status: 400 }
      );
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    const token = githubToken || process.env.GITHUB_TOKEN;
    const commits = await getRepoCommits(owner, repo, branch || undefined, 10, token);
    if (commits.length === 0) {
      return NextResponse.json(
        { error: "No commits found for this repository" },
        { status: 404 }
      );
    }

    const commitsWithDiffs = await Promise.all(
      commits.map((c) => getCommitDetails(owner, repo, c.sha, token))
    );

    // Stack trace line mapping: fetch actual source code around error lines
    const stackRefs = parseStackTrace(errorMessage);
    const relevantCode: RelevantCodeRef[] = [];
    if (stackRefs.length > 0 && commits.length > 0) {
      const headSha = commits[0].sha;
      await Promise.allSettled(
        stackRefs.map(async (ref) => {
          const content = await getFileContents(owner, repo, ref.path, headSha, token);
          if (content) {
            relevantCode.push({
              path: ref.path,
              line: ref.line,
              snippet: extractLines(content, ref.line),
            });
          }
        })
      );
    }

    const aiResult = await analyzeBug(errorMessage, commitsWithDiffs, relevantCode.length > 0 ? relevantCode : undefined);

    await connectDB();
    const analysis = await Analysis.create({
      userId: session.user.id,
      repoUrl,
      errorMessage,
      branch: branch || undefined,
      analyzedCommits: commitsWithDiffs.map((c) => ({
        sha: c.sha,
        message: c.message,
        author: c.author,
        date: c.date,
        diff: c.diff,
      })),
      aiResult,
    });

    return NextResponse.json({
      id: analysis._id.toString(),
      repoUrl,
      errorMessage,
      branch: branch || undefined,
      aiResult,
      analyzedCommits: commitsWithDiffs.map((c) => ({
        sha: c.sha,
        message: c.message,
        author: c.author,
        date: c.date,
      })),
      createdAt: analysis.createdAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/analyze] Error:", err);
    const status =
      message.includes("GitHub") || message.includes("404") ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
