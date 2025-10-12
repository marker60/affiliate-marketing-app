// app/api/brief/create/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title: string | undefined = body?.title;
    const source_url: string | null = body?.source_url ?? body?.url ?? null;
    const url: string | null = body?.url ?? null;

    if (!title) {
      return NextResponse.json({ error: "Missing 'title'." }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("briefs")
      .insert({ title, source_url, url })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST JSON: { title, source_url?, url? }" });
}
