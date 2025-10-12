// app/draft/[id]/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

type DraftRow = {
  id: string;
  created_at: string | null;
  title: string | null;
  md: string | null;
  html_raw: string | null;
  source_url: string | null;
  url: string | null;
};

export default async function DraftPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();

  // No generics on .from() — avoid the TS error "Expected 2 type arguments"
  const { data, error } = await supabase
    .from("drafts")
    .select("id, created_at, title, md, html_raw, source_url, url")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  // Narrow to our shape
  const row = data as DraftRow;

  const created = row.created_at
    ? new Date(row.created_at).toLocaleString()
    : "n/a";

  const hasHtml = !!row.html_raw && row.html_raw.trim().length > 0;
  const hasMd = !!row.md && row.md.trim().length > 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-400">
            {created} · {row.id.slice(0, 8)}…
          </div>
          <h1 className="text-2xl font-bold">
            {row.title || "(untitled draft)"}
          </h1>
        </div>
        <Link
          href="/draft"
          className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
        >
          Back to drafts
        </Link>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {row.source_url ? (
          <a
            href={row.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Open original
          </a>
        ) : row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Open original
          </a>
        ) : (
          <span className="text-zinc-500">No source URL</span>
        )}
      </div>

      <div className="rounded border border-zinc-800 p-4">
        {hasHtml ? (
          <article
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: row.html_raw! }}
          />
        ) : hasMd ? (
          <pre className="whitespace-pre-wrap text-sm text-zinc-200">
            {row.md}
          </pre>
        ) : (
          <div className="text-zinc-500">This draft has no content yet.</div>
        )}
      </div>
    </div>
  );
}
