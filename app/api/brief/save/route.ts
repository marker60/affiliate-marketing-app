// app/api/brief/save/route.ts
import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, html, source_url, url } = body ?? {};

    if (!title || !html) {
      return NextResponse.json({ error: "Missing title or html" }, { status: 400 });
    }

    const db = getSupabaseService();

    const { data, error } = await db
      .from("briefs")
      .insert({
        title,
        html,
        md: body.md ?? null,        // optional markdown if you have it
        source_url: source_url ?? null,
        url: url ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("brief/save insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err: any) {
    console.error("brief/save fatal:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
