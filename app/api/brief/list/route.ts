// app/api/brief/list/route.ts
import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getSupabaseService();

    const { data, error } = await db
      .from("briefs")
      .select("id, created_at, title, source_url, url")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("brief/list select error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err: any) {
    console.error("brief/list fatal:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
