import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const { data, error } = await supabase.auth.getSession()
  return NextResponse.json({
    ok: !error,
    hasSession: Boolean(data?.session),
  })
}
