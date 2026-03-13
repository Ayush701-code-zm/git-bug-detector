"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import AnalysisResult from "@/components/AnalysisResult";
import CommitList from "@/components/CommitList";

interface AnalysisData {
  id: string;
  repoUrl: string;
  errorMessage: string;
  branch?: string;
  aiResult: {
    suspected_commit_sha: string;
    suspected_commit_message: string;
    reason: string;
    suggested_fix: string;
  };
  analyzedCommits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }>;
  suspectedCommitDiff?: string;
  isPublic?: boolean;
}

export default function ResultsPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      setError("Missing analysis ID");
      setLoading(false);
      return;
    }

    fetch(`/api/analysis/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Analysis not found");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setIsPublic(d.isPublic ?? false);
        if (d.isPublic) {
          const base = window.location.origin;
          setShareUrl(`${base}/share/${d.id}`);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleShare() {
    if (!data) return;
    setShareLoading(true);
    try {
      const res = await fetch(`/api/analysis/${data.id}/share`, { method: "POST" });
      const json = await res.json();
      setIsPublic(json.isPublic);
      setShareUrl(json.shareUrl);
    } finally {
      setShareLoading(false);
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCreateIssue() {
    if (!data) return;
    setIssueLoading(true);
    setIssueError(null);
    try {
      const res = await fetch(`/api/analysis/${data.id}/create-issue`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setIssueUrl(json.issueUrl);
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setIssueLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10 text-emerald-500"
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
          <p className="text-zinc-400">Loading analysis...</p>
        </div>
      </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error || "Analysis not found"}</p>
          <Link
            href="/"
            className="inline-flex items-center text-emerald-500 hover:text-emerald-400"
          >
            ← Back to home
          </Link>
        </div>
      </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            ← New analysis
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
              <p className="mt-1 text-zinc-400 text-sm break-all">{data.repoUrl}</p>
              {data.branch && (
                <p className="text-zinc-500 text-sm">Branch: {data.branch}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Share button */}
              <button
                onClick={handleShare}
                disabled={shareLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
              >
                {shareLoading ? (
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                )}
                {isPublic ? "Make private" : "Share"}
              </button>

              {/* Create GitHub Issue button */}
              {!issueUrl ? (
                <button
                  onClick={handleCreateIssue}
                  disabled={issueLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
                >
                  {issueLoading ? (
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  Create GitHub Issue
                </button>
              ) : (
                <a
                  href={issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View issue #{issueUrl.split("/").pop()}
                </a>
              )}
            </div>
          </div>

          {/* Share URL banner */}
          {isPublic && shareUrl && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-zinc-400 text-xs font-mono truncate flex-1">{shareUrl}</span>
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {/* Issue error */}
          {issueError && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {issueError}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <AnalysisResult aiResult={data.aiResult} diff={data.suspectedCommitDiff} />
          <CommitList
            commits={data.analyzedCommits}
            suspectedSha={data.aiResult.suspected_commit_sha}
          />
        </div>

        <div className="mt-8 p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/50">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">
            Original Error
          </h3>
          <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap overflow-x-auto">
            {data.errorMessage}
          </pre>
        </div>
      </div>
    </main>
    </div>
  );
}
