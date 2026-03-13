"use client";

import { useState, useCallback } from "react";

interface AIResult {
  suspected_commit_sha: string;
  suspected_commit_message: string;
  reason: string;
  suggested_fix: string;
}

interface AnalysisResultProps {
  aiResult: AIResult;
  diff?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={copy}
      className="ml-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-1.5 py-0.5 rounded border border-zinc-700 hover:border-zinc-500"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function AnalysisResult({ aiResult, diff }: AnalysisResultProps) {
  const [showDiff, setShowDiff] = useState(false);
  const shortSha = aiResult.suspected_commit_sha.slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Suspected Breaking Commit
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-emerald-400 font-mono text-sm bg-zinc-900 px-2 py-1 rounded">
              {shortSha}
            </code>
            <span className="text-zinc-500 text-sm font-mono">{aiResult.suspected_commit_sha}</span>
            <CopyButton text={aiResult.suspected_commit_sha} />
          </div>
          <p className="text-zinc-200 font-medium">{aiResult.suspected_commit_message}</p>
          {diff && (
            <button
              type="button"
              onClick={() => setShowDiff((s) => !s)}
              className="mt-3 text-sm text-emerald-500 hover:text-emerald-400"
            >
              {showDiff ? "Hide diff" : "Show diff"}
            </button>
          )}
        </div>
      </div>

      {diff && showDiff && (
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Code changes</h3>
          <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-700/50 text-xs text-zinc-400 overflow-x-auto overflow-y-auto max-h-96 font-mono whitespace-pre">
            {diff}
          </pre>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Explanation</h3>
        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/50 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
          {aiResult.reason}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-zinc-400">Suggested Fix</h3>
          <CopyButton text={aiResult.suggested_fix} />
        </div>
        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
          {aiResult.suggested_fix}
        </div>
      </div>
    </div>
  );
}
