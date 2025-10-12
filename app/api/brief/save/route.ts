// app/api/brief/save/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title: string = body.title?.toString().trim() ?? "";
    const md: string =
      body.md?.toString() ??
      body.markdown?.toString() ??
      body.html?.toString() ?? // fallback: store HTML in md if that’s what we received
      "";

    // Either original scraped URL or user-entered fallback
    const source_url: string | null =
      body.source_url?.toString().trim() || body.url?.toString().trim() || null;

    if (!title || !md) {
      return NextResponse.json(
        { error: "Missing required fields: title and md/html" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("briefs")
      .insert([{ title, md, source_url, url: source_url }])
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
