// app/api/brief/create/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  title: z.string().min(1),
  source_url: z.string().url().nullable().optional(),
  url: z.string().url().nullable().optional(),
  md: z.string().optional(),
  html_raw: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    const row = {
      title: body.title,
      source_url: typeof body.source_url === "undefined" ? null : body.source_url,
      url: typeof body.url === "undefined" ? null : body.url,
      md: body.md ?? null,
      html_raw: body.html_raw ?? null,
    };

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("briefs")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
