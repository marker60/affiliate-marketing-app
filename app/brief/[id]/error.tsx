// app/brief/[id]/error.tsx
"use client";

export default function BriefDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-red-400">Couldn’t load this brief.</h2>
      <p className="text-sm text-zinc-400 mt-2">
        {error.message}
        {error.digest ? ` (digest ${error.digest})` : ""}
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
      >
        Retry
      </button>
    </div>
  );
}
