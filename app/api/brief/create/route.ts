// [LABEL: FILE] app/api/brief/create/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { BriefCreate, formatZodError } from "@/lib/validation/brief";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = BriefCreate.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { title, source_url, html, tags } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("briefs")
      .insert([{ title, source_url: source_url ?? null, html: html ?? null, tags: tags ?? null }])
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data!.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
