// app/api/brief/route.ts
// [LABEL: RUNTIME + IMPORTS]
export const runtime = "nodejs"
import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

// [LABEL: TYPES]
type ScrapeResult = {
  url: string
  title?: string
  description?: string
  bullets?: string[]
  text?: string
}
type ErrorResult = {
  ok: false
  error: string
  details?: string
}

// [LABEL: CONSTANTS — REQUEST HEADERS + TIMEOUT]
const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
const DEFAULT_HEADERS = {
  "user-agent": DEFAULT_UA,
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
}

// [LABEL: UTILS — FETCH WITH TIMEOUT]
async function fetchWithTimeout(url: string, ms = 15000): Promise<Response> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
    })
    return res
  } finally {
    clearTimeout(t)
  }
}

// [LABEL: DETECT ANTI-BOT / INTERSTITIAL]
function looksLikeAntiBot(html: string, title: string | undefined): boolean {
  const h = html.toLowerCase()
  const t = (title || "").toLowerCase()
  // Common indicators (Cloudflare / perimeterX / captcha walls)
  return (
    t.includes("just a moment") ||
    h.includes("cf-browser-verification") ||
    h.includes("cf-chl") ||
    h.includes("captcha") ||
    t.includes("checking your browser") ||
    h.includes("perimeterx") ||
    t.includes("robot check")
  )
}

// [LABEL: HTML → SCRAPE RESULT]
function parseHtml(url: string, html: string): ScrapeResult {
  const $ = cheerio.load(html)

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").first().text()?.trim() ||
    undefined

  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    undefined

  const bullets: string[] = []
  $("li").each((_, li) => {
    const s = $(li).text().replace(/\s+/g, " ").trim()
    if (s && s.length > 1) bullets.push(s)
  })

  const bodyText = $("body").text().replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
  return {
    url,
    title,
    description,
    bullets: bullets.slice(0, 50),
    text: bodyText.slice(0, 60_000), // keep result light
  }
}

// [LABEL: CORE — SCRAPE URL OR SURFACE ERROR]
async function scrape(url: string): Promise<ScrapeResult | ErrorResult> {
  let res: Response
  try {
    res = await fetchWithTimeout(url, 18000)
  } catch (e: any) {
    return { ok: false, error: "network_timeout", details: String(e?.message || e) }
  }

  if (!res.ok) {
    return { ok: false, error: `http_${res.status}`, details: await safeText(res) }
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").first().text()?.trim() ||
    undefined

  if (looksLikeAntiBot(html, title)) {
    return { ok: false, error: "blocked_by_anti_bot", details: title || "interstitial" }
  }

  return parseHtml(url, html)
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text()
  } catch {
    return ""
  }
}

// [LABEL: HANDLER — GET ?url=...]
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url")
  if (!url) {
    return NextResponse.json({ ok: false, error: "missing_url" }, { status: 400 })
  }

  const result = await scrape(url)
  if ("ok" in result && result.ok === false) {
    const status =
      result.error === "blocked_by_anti_bot" ? 403 :
      result.error.startsWith("http_") ? parseInt(result.error.slice(5)) || 500 :
      result.error === "network_timeout" ? 504 :
      500
    return NextResponse.json(result, { status })
  }

  return NextResponse.json(result as ScrapeResult, { status: 200 })
}

// [LABEL: HANDLER — POST {url}]
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const url = body?.url as string | undefined
  if (!url) {
    return NextResponse.json({ ok: false, error: "missing_url" }, { status: 400 })
  }

  const result = await scrape(url)
  if ("ok" in result && result.ok === false) {
    const status =
      result.error === "blocked_by_anti_bot" ? 403 :
      result.error.startsWith("http_") ? parseInt(result.error.slice(5)) || 500 :
      result.error === "network_timeout" ? 504 :
      500
    return NextResponse.json(result, { status })
  }

  return NextResponse.json(result as ScrapeResult, { status: 200 })
}
