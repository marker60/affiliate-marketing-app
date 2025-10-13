// app/api/brief/save/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, md, html_raw, source_url, url } = body ?? {};

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const updates: Record<string, string | null> = {};
    if (typeof title === "string") updates.title = title;
    if (typeof md === "string") updates.md = md;
    if (typeof html_raw === "string") updates.html_raw = html_raw;
    if (typeof source_url === "string") updates.source_url = source_url;
    if (typeof url === "string") updates.url = url;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("briefs")
      .update(updates)
      .eq("id", id)
      .select("id")
      .maybeSingle(); // avoids “Cannot coerce … to a single JSON object”

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found or no changes" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
