import RepoInputForm from "@/components/RepoInputForm";
import Header from "@/components/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            CommitDetective AI
          </h1>
          <p className="mt-2 text-zinc-400">
            Find which commit likely introduced your bug
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl">
          <RepoInputForm />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Paste your GitHub repo URL and error message. We&apos;ll analyze recent
          commits and pinpoint the culprit.
        </p>
      </div>
    </main>
    </div>
  );
}
