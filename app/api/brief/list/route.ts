import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // <- your server supabase helper

export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("briefs")
      .select("id, created_at, title, source_url, url")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("[/api/brief/list] error:", err?.message || err);
    return NextResponse.json({ ok: false, error: err?.message || "unknown" }, { status: 500 });
  }
}
