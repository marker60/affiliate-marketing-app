export const runtime="nodejs";
import { createClient } from "@supabase/supabase-js";

export async function GET(_req:Request,{ params }:{ params:{ id:string }}) {
  const supabase=createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pages, error } = await supabase.from("pages")
    .select("title,draft,created_at")
    .eq("project_id", params.id)
    .order("created_at",{ascending:false})
    .limit(1);

  if(error) return new Response(error.message,{status:500});
  const page=pages?.[0];
  const name=(page?.title?.toLowerCase().replace(/[^a-z0-9]+/g,"-")||"draft")+".md";
  const body = page?.draft ?? "# Draft\n\n_No draft available._";

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`
    }
  });
}
 
