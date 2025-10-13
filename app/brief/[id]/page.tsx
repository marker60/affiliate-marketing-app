// app/draft/[id]/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DraftRow = {
  id: string;
  created_at: string | null;
  title: string | null;
  md: string | null;
  html_raw: string | null;
  source_url: string | null;
  url: string | null;
};

export default async function DraftDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();

  // Load the draft safely (no MD/HTML parsing at build time)
  const { data, error } = await supabase
    .from("drafts")
    .select("id, created_at, title, md, html_raw, source_url, url")
    .eq("id", params.id)
    .single();

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-bold">Draft</h1>
        <p className="text-red-400">Couldn’t load this draft: {error.message}</p>
        <Link
          href="/draft"
          className="inline-block
