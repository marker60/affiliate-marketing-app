import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

type Draft = {
  id: string;
  title: string | null;
  content_markdown: string | null; // adjust if your column name differs
  updated_at: string | null;
};

export default async function DraftPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("drafts")
    .select("id,title,content_markdown,updated_at")
    .eq("id", params.id)
    .single<Draft>();

  if (error || !data) {
    // If the record isn't found, render Next's 404 page
    return notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{data.title ?? "Untitled draft"}</h1>
        <Link
          href="/dashboard"
          className="text-sm px-3 py-1 rounded border border-zinc-700 hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="text-xs text-zinc-400">
        Last updated:{" "}
        {data.updated_at
          ? new Date(data.updated_at).toLocaleString()
          : "unknown"}
      </div>

      <article className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.content_markdown ?? "_No content_"}
        </ReactMarkdown>
      </article>
    </div>
  );
}
