import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

type BriefRow = {
  id: string;
  title: string | null;
  markdown?: string | null;
  content_markdown?: string | null;
  html_raw?: string | null;
  created_at?: string | null;
};

export default async function ExportPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("briefs")
    .select("id,title,markdown,content_markdown,html_raw,created_at")
    .eq("id", params.id)
    .single<BriefRow>();

  if (error || !data) return notFound();

  const md =
    data.markdown ??
    data.content_markdown ??
    "_No markdown stored for this brief yet._";

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Export: {data.title ?? "(untitled)"}
        </h1>
        <Link
          href={`/brief/${data.id}`}
          className="text-sm px-3 py-1 rounded border border-zinc-700 hover:bg-zinc-800"
        >
          Back to brief
        </Link>
      </div>

      <p className="text-zinc-400 text-sm">Copy the markdown below.</p>

      <textarea
        className="w-full h-[60vh] rounded border border-zinc-700 bg-zinc-900 p-3 font-mono text-sm"
        readOnly
        value={md}
      />
    </div>
  );
}
