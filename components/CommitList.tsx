"use client";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface CommitListProps {
  commits: Commit[];
  suspectedSha?: string;
}

export default function CommitList({ commits, suspectedSha }: CommitListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">
        Commits Analyzed ({commits.length})
      </h3>
      <div className="space-y-1">
        {commits.map((commit) => {
          const isSuspected = commit.sha === suspectedSha;
          return (
            <div
              key={commit.sha}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isSuspected
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-zinc-700/50 bg-zinc-900/30 hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex-shrink-0 w-14">
                <code className="text-xs font-mono text-zinc-500">
                  {commit.sha.slice(0, 7)}
                </code>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">{commit.message}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {commit.author} · {new Date(commit.date).toLocaleString()}
                </p>
              </div>
              {isSuspected && (
                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                  Suspected
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
