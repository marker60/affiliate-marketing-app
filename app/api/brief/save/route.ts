import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import scrape from "@/lib/scrape"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST: insert provided data
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { url, title, description, bullets, text } = body || {}
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 })

    const { data, error } = await supabase
      .from("briefs")
      .insert([{ url, title, description, bullets, text }])
      .select("id")
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

// GET: scrape then insert (?url=)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")
    if (!url) return NextResponse.json({ error: "Missing ?url=" }, { status: 400 })

    const s = await scrape(url)
    const { data, error } = await supabase
      .from("briefs")
      .insert([s])
      .select("id")
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
