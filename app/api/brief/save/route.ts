// app/api/brief/save/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { title, source_url, html } = await req.json();

    if (!title || !html) {
      return NextResponse.json(
        { ok: false, error: "Missing title or html" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("briefs")
      .insert({
        title,
        source_url: source_url || null,
        url: source_url || null,      // keep “Open original” working
        html_raw: html,               // store what user pasted
        md: null,                     // optional, leave null for now
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
