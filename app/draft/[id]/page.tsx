export const dynamic="force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default async function DraftPage({ params }:{ params:{ id:string }}) {
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user) redirect("/auth/login");

  const { data: pages } = await s.from("pages")
    .select("title,url,draft,created_at")
    .eq("project_id", params.id)
    .order("created_at",{ascending:false})
    .limit(1);

  const page = pages?.[0];
  return (
    <main className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Draft: {page?.title ?? "Untitled"}</h1>
      {page?.url && <div className="text-sm text-muted-foreground break-all">
        Source: <a className="underline" href={page.url} target="_blank" rel="noreferrer">{page.url}</a>
      </div>}
      <article className="prose max-w-none">
        <ReactMarkdown>{page?.draft ?? "_No draft yet._"}</ReactMarkdown>
      </article>
    </main>
  );
}
 
