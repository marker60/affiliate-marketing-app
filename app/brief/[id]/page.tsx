// app/brief/[id]/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";

type BriefRow = {
  id: string;
  created_at: string | null;
  title: string;
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

  // Note: remove generic <BriefRow> to avoid the “Expected 2 type arguments” error
  const { data, error } = await supabase
    .from("briefs")
    .select("id, created_at, title, source_url, url, md, html_raw")
    .eq("id", params.id)
    .single();

  if (error) {
    return (
      <div className="p-6">
        <Link href="/brief" className="underline text-sm">
          ← Back
        </Link>
        <div className="mt-4 text-red-400">Error: {error.message}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Link href="/brief" className="underline text-sm">
          ← Back
        </Link>
        <div className="mt-4 text-zinc-400">Not found.</div>
      </div>
    );
  }

  const source = data.source_url || data.url;

  return (
    <div className="p-6 space-y-4">
      <Link href="/brief" className="text-sm underline">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold">{data.title}</h1>

      <div className="text-xs text-zinc-400">
        {new Date(data.created_at ?? Date.now()).toLocaleString()} ·{" "}
        {data.id.slice(0, 8)}…
      </div>

      {source ? (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Open original
        </a>
      ) : (
        <span className="text-zinc-500">No source URL</span>
      )}

      {data.md ? (
        <pre className="whitespace-pre-wrap">{data.md}</pre>
      ) : data.html_raw ? (
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: data.html_raw }}
        />
      ) : (
        <div className="text-zinc-500">No content</div>
      )}
    </div>
  );
}
