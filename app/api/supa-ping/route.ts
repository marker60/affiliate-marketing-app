import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.auth.getSession();

    return NextResponse.json({
      ok: !error,
      hasSession: Boolean(data?.session),
      error: error?.message ?? null,
    });
  } catch (err: any) {
    console.error("API /supa-ping error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
