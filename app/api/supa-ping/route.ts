// [LABEL: FILE] app/api/supa-ping/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Constructing the client verifies required envs are present.
  const supa = getSupabaseServer();
  if (!supa) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, service: "supabase", ping: "pong" });
}
