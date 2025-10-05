"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function generateBrief(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const productUrlRaw = String(formData.get("productUrl") || "").trim();
  if (!projectId || !productUrlRaw) redirect(`/brief/${projectId}?error=missing_inputs`);
  const productUrl = /^https?:\/\//i.test(productUrlRaw) ? productUrlRaw : `https://${productUrlRaw}`;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const brief = `SEO Brief:\nSource: ${productUrl}\n\nOutline:\nIntro\nKey Features\nPros & Cons\nFAQ\nVerdict`;
  const draft = `Disclosure: This page uses affiliate links.\n\nPros:\n- Example\n\nCons:\n- Example\n\nKey FAQ:\n- Example`;

  const { data: existing } = await supabase
    .from("pages").select("id").eq("project_id", projectId)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (existing?.id) {
    await supabase.from("pages").update({ url: productUrl, brief, draft }).eq("id", existing.id);
  } else {
    await supabase.from("pages").insert({ project_id: projectId, url: productUrl, brief, draft });
  }
  redirect(`/brief/${projectId}`);
}
