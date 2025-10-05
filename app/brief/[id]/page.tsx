// app/brief/[id]/page.tsx
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BriefForm from "./BriefForm";

export default async function BriefPage(
  { params, searchParams }: { params: { id: string }, searchParams?: { error?: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } =
    await supabase.from("projects")
      .select("id,name,description")
      .eq("id", params.id)
      .single();

  const { data: pages } =
    await supabase.from("pages")
      .select("id,url,brief,draft,created_at")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false })
      .limit(1);

  return (
    <main className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Brief: {project?.name}</h1>

      {searchParams?.error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Error: {searchParams.error}
        </div>
      )}

      <BriefForm projectId={params.id} />

      {pages && pages[0] && (
        <div className="space-y-2 border rounded p-4 overflow-x-auto">
          <div className="text-sm text-muted-foreground">
            Last URL:{" "}
            <a
              href={pages[0].url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="underline break-all"
            >
              {pages[0].url
                ? new URL(pages[0].url).origin + new URL(pages[0].url).pathname
                : "—"}
            </a>
          </div>

          <h2 className="font-semibold">Brief</h2>
          <pre className="whitespace-pre-wrap break-words text-sm">
            {pages[0].brief}
          </pre>

          <h2 className="font-semibold">Draft Starter</h2>
          <pre className="whitespace-pre-wrap break-words text-sm">
            {pages[0].draft}
          </pre>
        </div>
      )}
    </main>
  );
}
