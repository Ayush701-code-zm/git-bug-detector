"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold text-white hover:text-zinc-200 transition-colors"
        >
          CommitDetective AI
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/history"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              History
            </Link>
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-zinc-400 hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
