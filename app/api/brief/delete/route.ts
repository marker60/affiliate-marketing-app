// [LABEL: TOP IMPORTS]
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// [LABEL: ROUTE SETTINGS]
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// [LABEL: DELETE VIA QUERY (?id=...)]
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing ?id=" }, { status: 400 })
  }

  const { error } = await supabase.from("briefs").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, id }, { status: 200 })
}

// [LABEL: ALSO SUPPORT POST { id }]
export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing body.id" }, { status: 400 })
    }
    const { error } = await supabase.from("briefs").delete().eq("id", id)
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, id }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
