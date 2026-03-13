import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-600">404</h1>
        <p className="mt-2 text-zinc-400">Page not found</p>
        <Link
          href="/"
          className="mt-6 inline-block text-emerald-500 hover:text-emerald-400"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
