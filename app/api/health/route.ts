// [LABEL: FILE] app/api/health/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const checks: Record<string, unknown> = {};
  const env = {
    vercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  };
  let status = 200;

  try {
    const supa = getSupabaseServer();
    const { error } = await supa.from("briefs").select("id").limit(1);
    checks.supabase = error ? { ok: false, error: error.message } : { ok: true };
    if (error) status = 503;
  } catch (e: any) {
    checks.supabase = { ok: false, error: e?.message ?? "unknown" };
    status = 503;
  }

  return NextResponse.json(
    { ok: status === 200, uptime_ms: Date.now() - started, env, checks },
    { status }
  );
}
