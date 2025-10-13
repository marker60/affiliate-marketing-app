// app/api/brief/save/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  md: z.string().optional(),
  html_raw: z.string().optional(),
  source_url: z.string().url().nullable().optional(),
  url: z.string().url().nullable().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    // Build partial update only with provided fields
    const update: Record<string, unknown> = {};
    if (typeof body.title !== "undefined") update.title = body.title;
    if (typeof body.md !== "undefined") update.md = body.md;
    if (typeof body.html_raw !== "undefined") update.html_raw = body.html_raw;
    if (typeof body.source_url !== "undefined") update.source_url = body.source_url;
    if (typeof body.url !== "undefined") update.url = body.url;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Do the update; do not force .single() to avoid the “Cannot coerce…” error
    const { data, error } = await supabase
      .from("briefs")
      .update(update)
      .eq("id", body.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If RLS prevented the update or the row didn’t exist, data may be null
    if (!data) {
      return NextResponse.json(
        { ok: false, id: body.id, note: "No row updated (check RLS / id)" },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
