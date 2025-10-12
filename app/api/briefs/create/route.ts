import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Create a brief from either markdown (`md`) or raw HTML (`html`).
 * Body: { title?: string, md?: string, html?: string, source_url?: string, url?: string }
 */
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json().catch(() => ({}));

    const title: string = (body?.title ?? "").toString().trim() || "Untitled";
    const md: string | undefined = typeof body?.md === "string" ? body.md : undefined;
    const html: string | undefined = typeof body?.html === "string" ? body.html : undefined;
    const source_url: string | null =
      (typeof body?.source_url === "string" && body.source_url.trim()) ||
      (typeof body?.url === "string" && body.url.trim()) ||
      null;

    // Prefer markdown if provided; otherwise store the HTML as-is in md (you can parse later).
    const content = md ?? html ?? "";

    const { data, error } = await supabase
      .from("briefs")
      .insert({
        title,
        md: content,
        source_url,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 400 });
  }
}
