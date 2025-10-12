import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";          // ensure Node runtime on Vercel
export const dynamic = "force-dynamic";   // don't prerender
export const revalidate = 0;              // always fetch fresh

type BriefRow = {
  id: string;
  created_at: string | null;
  title: string;
  source_url: string | null;
  url: string | null;
  md: string | null;
  html_raw: string | null;
};

export default async function BriefPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer();

  // Load the brief directly from Supabase
  const { data, error } = await supabase
    .from<BriefRow>("briefs")
    .select("id, created_at, title, source_url, url, md, html_raw")
    .eq("id", params.id)
    .single();

  if (error) {
    // Log so you can see it in Vercel logs; render a generic error to users
    console.error("brief/[id] load error:", error);
    throw new Error("Failed to load brief");
  }
  if (!data) {
    notFound();
  }

  const source = data.source_url || data.url || null;

  return (
    <div className="p-6 space-y-4">
      <div className="text-sm text-zinc-400">
        {new Date(data.created_at ?? Date.now()).toLocaleString()} · {data.id}
      </div>

      <h1 className="text-2xl font-bold">{data.title}</h1>

      <div className="flex gap-3">
        <Link href="/brief" className="text-blue-400 hover:underline">
          ← Back to briefs
        </Link>
        {source ? (
          <a
            href={source}
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

      {/* Prefer markdown if present; otherwise show raw HTML as a code block preview */}
      {data.md ? (
        <section className="prose prose-invert max-w-none">
          {/* If you later want pretty markdown rendering, pipe through a renderer here */}
          <pre className="whitespace-pre-wrap">{data.md}</pre>
        </section>
      ) : data.html_raw ? (
        <section>
          <h2 className="text-lg font-semibold mb-2">HTML (raw)</h2>
          <pre className="bg-zinc-900/50 p-3 rounded overflow-auto text-xs">
            {data.html_raw}
          </pre>
        </section>
      ) : (
        <p className="text-zinc-500">No content stored for this brief yet.</p>
      )}
    </div>
  );
}
