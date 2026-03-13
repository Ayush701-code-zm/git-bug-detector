"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-zinc-400 text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
