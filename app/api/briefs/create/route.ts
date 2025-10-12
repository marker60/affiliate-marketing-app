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
    const md: string | undefined =
      typeof body?.md === "string" && body.md.trim() ? body.md : undefined;
    const html: string | undefined =
      typeof body?.html === "string" && body.html.trim() ? body.html : undefined;

    // Prefer md if provided; else store the raw HTML in `md` so the UI can still preview it via react-markdown.
    // (react-markdown will just render the text; if you want HTML rendering, we can add a toggle later.)
    const content = md ?? html ?? "";

    const source_url: string | null =
      (typeof body?.source_url === "string" && body.source_url.trim()) ||
      (typeof body?.url === "string" && body.url.trim()) ||
      null;

    const { data, error } = await supabase
      .from("briefs")
      .insert({
        title,
        md: content,
        source_url,
        url: source_url, // keep legacy field populated too, for older UIs
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
