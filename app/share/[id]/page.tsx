"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  createdAt: string;
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/analysis/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Analysis not found or not shared publicly");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen">
      {/* Minimal public header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-emerald-500 font-mono text-lg font-bold">⬡</span>
            <span className="text-white font-semibold text-sm">CommitDetective AI</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Sign in to analyze your own repos →
          </Link>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-zinc-400">Loading analysis...</p>
            </div>
          ) : error || !data ? (
            <div className="text-center py-24 space-y-4">
              <p className="text-red-400">{error || "Analysis not found"}</p>
              <p className="text-zinc-500 text-sm">This analysis may have been made private or doesn&apos;t exist.</p>
              <Link href="/" className="inline-block mt-2 text-emerald-500 hover:text-emerald-400">
                Try CommitDetective AI →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Shared analysis
                </div>
                <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
                <p className="mt-1 text-zinc-400 text-sm break-all">{data.repoUrl}</p>
                {data.branch && (
                  <p className="text-zinc-500 text-sm">Branch: {data.branch}</p>
                )}
                <p className="text-zinc-600 text-xs mt-1">
                  Analyzed on {new Date(data.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-8">
                <AnalysisResult aiResult={data.aiResult} diff={data.suspectedCommitDiff} />
                <CommitList
                  commits={data.analyzedCommits}
                  suspectedSha={data.aiResult.suspected_commit_sha}
                />
              </div>

              <div className="mt-8 p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/50">
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Original Error</h3>
                <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap overflow-x-auto">
                  {data.errorMessage}
                </pre>
              </div>

              {/* CTA */}
              <div className="mt-10 p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
                <p className="text-zinc-300 font-medium mb-1">Dealing with a mystery bug?</p>
                <p className="text-zinc-500 text-sm mb-4">
                  CommitDetective AI analyzes your commits and pinpoints exactly which one introduced the bug.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                >
                  Try it free →
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
