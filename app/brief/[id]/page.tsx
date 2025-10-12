import React from "react";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default async function BriefDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("briefs")
    .select("id, created_at, title, md, source_url, url")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    // On query errors, surface 404 to avoid crashing build/SSR
    notFound();
  }
  if (!data) {
    notFound();
  }

  const created =
    data.created_at ? new Date(data.created_at).toLocaleString() : "";
  const source = data.source_url || data.url || null;
  const content = data.md || "";

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-400">{created}</div>
          <h1 className="text-2xl font-bold">{data.title || "Untitled"}</h1>
        </div>

        <div className="flex gap-2">
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
          ) : (
            <span className="px-3 py-2 rounded bg-zinc-800 text-zinc-400">
              No source URL
            </span>
          )}
        </div>
      </div>

      <div className="rounded border border-zinc-800 p-4 prose prose-invert max-w-none">
        {content.trim() ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        ) : (
          <div className="text-zinc-400">No content yet.</div>
        )}
      </div>
    </div>
  );
}
