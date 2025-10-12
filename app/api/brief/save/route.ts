// app/api/brief/save/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, title, md, html_raw, source_url, url } = body as {
    id: string;
    title?: string | null;
    md?: string | null;
    html_raw?: string | null;
    source_url?: string | null;
    url?: string | null;
  };

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("briefs")
    .update({ title, md, html_raw, source_url, url })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
