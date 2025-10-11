import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = "briefs";

export async function GET() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, created_at, title, source_url, url")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
