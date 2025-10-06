// app/draft/[id]/page.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DraftPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pages")
    .select("draft,title,project_id")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Draft not found</h1>
        <p className="mt-2 text-muted-foreground">{error?.message}</p>
        <Link href="/dashboard" className="mt-6 inline-block underline">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-3xl font-bold">
        {data.title ?? "Draft Preview"}
      </h1>

      <article className="prose prose-neutral max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.draft ?? ""}
        </ReactMarkdown>
      </article>

      <div className="mt-8">
        <Link
          href={`/export/${params.id}`}
          className="underline"
        >
          Go to Export
        </Link>
      </div>
    </main>
  );
}
