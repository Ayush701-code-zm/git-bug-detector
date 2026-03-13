"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

interface AnalysisItem {
  id: string;
  repoUrl: string;
  errorPreview: string;
  branch?: string;
  suspectedSha?: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analyses")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load analyses");
        return res.json();
      })
      .then((data) => setAnalyses(data.analyses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-4"
          >
            ← New analysis
          </Link>
          <h1 className="text-2xl font-bold text-white">Analysis History</h1>
          <p className="mt-1 text-zinc-400 text-sm">
            Your past bug analyses
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-emerald-500"
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
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        ) : analyses.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <p className="text-zinc-400">No analyses yet</p>
            <Link
              href="/"
              className="mt-4 inline-block text-emerald-500 hover:text-emerald-400"
            >
              Run your first analysis →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((a) => (
              <Link
                key={a.id}
                href={`/results?id=${a.id}`}
                className="block p-4 rounded-lg border border-zinc-700/50 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-300 truncate">{a.repoUrl}</p>
                    <p className="mt-1 text-xs text-zinc-500 font-mono line-clamp-2">
                      {a.errorPreview}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                      {a.suspectedSha && (
                        <span className="text-amber-400">{a.suspectedSha}</span>
                      )}
                      {a.branch && <span>Branch: {a.branch}</span>}
                      <span>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-zinc-500 flex-shrink-0">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
