import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const TABLE = "briefs";

function extractCanonical(html: string): string | null {
  try {
    const m =
      html.match(/<link[^>]+rel=["']?canonical["']?[^>]*href=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { title, html, source_url } = await req.json();

    if (!title || !html) {
      return NextResponse.json({ error: "title and html are required" }, { status: 400 });
    }

    const canonical = extractCanonical(html);
    // Store both; url is optional now
    const payload = {
      title,
      html,
      source_url: source_url || canonical || null,
      url: canonical || source_url || null,
    };

    const { data, error } = await supabase.from(TABLE).insert(payload).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
