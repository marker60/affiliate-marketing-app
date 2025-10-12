// app/brief/[id]/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BriefRow = {
  id: string;
  created_at: string | null;
  title: string | null;
  source_url: string | null;
  url: string | null;
  md: string | null;
  html_raw: string | null;
};

export default async function BriefDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();

  // Fetch the brief safely
  const { data, error } = await supabase
    .from("briefs")
    .select("id, created_at, title, source_url, url, md, html_raw")
    .eq("id", params.id)
    .single();

  if (error) {
    // Render a readable error (error boundary not required)
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-bold">Brief</h1>
        <p className="text-red-400">
          Couldn’t load this brief: {error.message}
        </p>
        <Link
          href="/brief"
          className="inline-block px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
        >
          Back to Briefs
        </Link>
      </div>
    );
  }

  const row = (data ?? null) as BriefRow | null;
  if (!row) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-bold">Brief</h1>
        <p className="text-zinc-400">This brief does not exist.</p>
        <Link
          href="/brief"
          className="inline-block px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
        >
          Back to Briefs
        </Link>
      </div>
    );
  }

  const title = row.title || "(untitled)";
  const source = row.source_url || row.url;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-400">
            {row.created_at
              ? new Date(row.created_at).toLocaleString()
              : "—"}{" "}
            · {row.id}
          </div>
          <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/brief"
            className="px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
          >
            Back
          </Link>
          {source ? (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500"
            >
              Open original
            </a>
          ) : null}
        </div>
      </div>

      {/* Prefer markdown if present; otherwise show HTML length */}
      {row.md ? (
        <div className="rounded border border-zinc-800 p-4 whitespace-pre-wrap">
          {row.md}
        </div>
      ) : row.html_raw ? (
        <div className="rounded border border-zinc-800 p-4 text-sm text-zinc-400">
          Stored HTML length: {row.html_raw.length.toLocaleString()} bytes
        </div>
      ) : (
        <div className="text-zinc-400">No content stored for this brief.</div>
      )}
    </div>
  );
}
