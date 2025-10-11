import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side
);
const TABLE = "briefs";

export default async function BriefDetail({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, html, source_url, url, created_at")
    .eq("id", params.id)
    .single();

  if (error || !data) return <div className="p-6">Not found.</div>;

  const source = data.source_url || data.url;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <Link href="/brief" className="text-blue-400 hover:underline">← Back</Link>
      </div>

      <div className="text-sm text-zinc-400">
        {new Date(data.created_at ?? Date.now()).toLocaleString()} · {data.id.slice(0, 8)}…
      </div>

      <div className="flex gap-3">
        {source ? (
          <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            Open original
          </a>
        ) : (
          <span className="text-zinc-500">No source URL</span>
        )}
      </div>

      {/* Render raw HTML in a sandboxed iframe-like div */}
      <div className="rounded border border-zinc-800 p-4 overflow-x-auto bg-zinc-950">
        <pre className="text-xs whitespace-pre-wrap">{data.html}</pre>
      </div>
    </div>
  );
}
