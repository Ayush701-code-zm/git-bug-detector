import Groq from "groq-sdk";
import type { CommitInfo } from "./github";

export interface AIAnalysisResult {
  suspected_commit_sha: string;
  suspected_commit_message: string;
  reason: string;
  suggested_fix: string;
}

// Max chars per diff to stay within Groq free-tier TPM limits (~8k tokens total for diffs)
const MAX_DIFF_CHARS = 1500;
const MAX_COMMITS = 7;

function formatCommitDiffs(commits: CommitInfo[]): string {
  return commits
    .slice(0, MAX_COMMITS)
    .map((c) => {
      const header = `=== COMMIT: ${c.sha} ===\nMessage: ${c.message}\nAuthor: ${c.author}\nDate: ${c.date}`;
      let diff = "(No diff available)";
      if (c.diff) {
        const truncated = c.diff.slice(0, MAX_DIFF_CHARS);
        diff = truncated.length < c.diff.length
          ? truncated + "\n... (diff truncated)"
          : truncated;
      }
      return `${header}\nDiff:\n${diff}`;
    })
    .join("\n\n");
}

export interface RelevantCodeRef {
  path: string;
  line: number;
  snippet: string;
}

export async function analyzeBug(
  errorMessage: string,
  commitDiffs: CommitInfo[],
  relevantCode?: RelevantCodeRef[]
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }

  const groq = new Groq({ apiKey });
  const formattedDiffs = formatCommitDiffs(commitDiffs);

  const systemPrompt = `You are a senior software engineer debugging a production issue.
Your task is to analyze recent commits and identify which one most likely introduced a bug.
Return ONLY valid JSON with these exact keys (no markdown, no extra text):
- suspected_commit_sha (string)
- suspected_commit_message (string)
- reason (string, detailed explanation)
- suggested_fix (string, actionable fix steps)`;

  const codeContext =
    relevantCode && relevantCode.length > 0
      ? `\n\nRELEVANT SOURCE FILES (from the stack trace):\n${relevantCode
          .map((r) => `--- ${r.path} (around line ${r.line}) ---\n${r.snippet}`)
          .join("\n\n")}`
      : "";

  const userPrompt = `A developer reported the following error:

ERROR:
${errorMessage}${codeContext}

Below are recent commits in the repository with code changes:

${formattedDiffs}

Analyze which commit most likely introduced the bug. Return ONLY a JSON object with: suspected_commit_sha, suspected_commit_message, reason, suggested_fix.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from AI");
  }

  let parsed: AIAnalysisResult;
  try {
    const cleaned = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
    parsed = JSON.parse(cleaned) as AIAnalysisResult;
  } catch {
    throw new Error(`AI returned invalid JSON: ${content.slice(0, 200)}`);
  }

  if (
    !parsed.suspected_commit_sha ||
    !parsed.suspected_commit_message ||
    !parsed.reason ||
    !parsed.suggested_fix
  ) {
    throw new Error("AI response missing required fields");
  }

  return parsed;
}
