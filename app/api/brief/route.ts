// [LABEL: TOP IMPORTS]
import { NextResponse } from "next/server"
import scrape from "@/lib/scrape"

// [LABEL: ROUTE SETTINGS]
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// [LABEL: HELPERS]
async function readUrlFromRequest(req: Request): Promise<string | null> {
  const { searchParams } = new URL(req.url)
  const qp = searchParams.get("url")
  if (qp) return qp

  const ct = (req.headers.get("content-type") || "").toLowerCase()

  // Try JSON body
  if (ct.includes("application/json")) {
    try {
      const j = await req.json()
      return (j?.url || j?.productUrl || j?.href || null) as string | null
    } catch {
      /* ignore and try form data */
    }
  }

  // Try form body
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    try {
      const fd = await req.formData()
      const v = (fd.get("url") || fd.get("productUrl") || fd.get("href")) as string | null
      if (v) return v
    } catch {
      /* ignore */
    }
  }

  return null
}

// [LABEL: GET HANDLER]
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

// [LABEL: POST HANDLER — accepts JSON or form-data, keys: url/productUrl/href]
export async function POST(req: Request) {
  try {
    const url = await readUrlFromRequest(req)
    if (!url) {
      return NextResponse.json({ error: "Missing url in body or query" }, { status: 400 })
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
