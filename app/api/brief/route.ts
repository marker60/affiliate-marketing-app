import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

/** ── Supabase admin (bypasses RLS) with env fallbacks ───────────────────────
 * Works with either:
 *  - SUPABASE_URL  or NEXT_PUBLIC_SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE  or SUPABASE_SERVICE_ROLE_KEY
 */
function admin() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole =
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error(
      "Missing Supabase envs. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

/* --- the rest of the file is identical to your current version ---
   (HTML parsing, GET(list/id), DELETE, POST with preview/save, etc.)
*/

// … KEEP your existing helpers (titleFromUrl, htmlToMarkdown) …

// GET /api/brief
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const listParam = searchParams.get("list");

  const db = admin();

  if (listParam) {
    const limit =
      /^(true|1)$/i.test(listParam) ? 50 : Math.max(1, Math.min(100, parseInt(listParam, 10) || 5));
    const { data, error } = await db
      .from("briefs")
      .select("id,url,title,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (id) {
    const { data, error } = await db.from("briefs").select("*").eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/brief?id=…
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = admin();
  const { error } = await db.from("briefs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// POST /api/brief  (URL or { html, preview|save })
export async function POST(req: NextRequest) {
  const db = admin();
  const body = await req.json().catch(() => ({}));
  const { url, html, preview, save } = body as {
    url?: string;
    html?: string;
    preview?: boolean;
    save?: boolean;
  };

  // … KEEP your existing URL-fetch branch and HTML preview/save branches …
}
