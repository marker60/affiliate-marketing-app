// app/api/brief/route.ts
import { NextResponse } from "next/server"
import scrape from "@/lib/scrape"

// Use Node runtime to avoid Edge gotchas while we verify
export const runtime = "nodejs"
// Ensure this route is always executed server-side fresh
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Missing ?url=" }, { status: 400 })
  }
  try {
    const result = await scrape(url)
    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Scrape failed", message: String(err?.message || err) },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: "Missing body.url" }, { status: 400 })
    }
    const result = await scrape(url)
    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Scrape failed", message: String(err?.message || err) },
      { status: 500 }
    )
  }
}
