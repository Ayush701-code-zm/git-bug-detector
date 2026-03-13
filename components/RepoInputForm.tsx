"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RepoInputForm() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [branch, setBranch] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          errorMessage: errorMessage.trim(),
          branch: branch.trim() || undefined,
          githubToken: githubToken.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      router.push(`/results?id=${encodeURIComponent(data.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="repoUrl"
          className="block text-sm font-medium text-zinc-400 mb-2"
        >
          GitHub Repository URL
        </label>
        <input
          id="repoUrl"
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          required
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="errorMessage"
          className="block text-sm font-medium text-zinc-400 mb-2"
        >
          Error Message / Stack Trace
        </label>
        <textarea
          id="errorMessage"
          value={errorMessage}
          onChange={(e) => setErrorMessage(e.target.value)}
          placeholder="Paste your error message or stack trace here..."
          rows={6}
          required
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors font-mono text-sm resize-y min-h-[120px]"
        />
      </div>

      <div>
        <label
          htmlFor="branch"
          className="block text-sm font-medium text-zinc-400 mb-2"
        >
          Branch <span className="text-zinc-500">(optional)</span>
        </label>
        <input
          id="branch"
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="main"
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowToken((s) => !s)}
          className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          {showToken ? "−" : "+"} GitHub token for private repos
        </button>
        {showToken && (
          <div className="mt-2">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors text-sm"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Analyzing...
          </>
        ) : (
          "Analyze Bug"
        )}
      </button>
    </form>
  );
}
