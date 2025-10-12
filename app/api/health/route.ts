// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Keep it safe: never echo values. Just booleans + a tiny hint.
  const urlHost = (() => {
    try {
      return hasUrl ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL as string).host : null;
    } catch {
      return "INVALID_URL";
    }
  })();

  return NextResponse.json({
    ok: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnon,
      urlHost,
    },
    note:
      "If either flag is false in Production, set env vars in Vercel → Project → Settings → Environment Variables (Production) and redeploy.",
  });
}
