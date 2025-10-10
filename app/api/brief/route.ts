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

// [LABEL: DETECT ANTI-BOT / INTERSTITIAL (CONSERVATIVE)]
function looksLikeAntiBot(html: string, title: string | undefined): boolean {
  const h = html.toLowerCase()
  const t = (title || "").toLowerCase()

  // individual signals
  const signals = [
    /just a moment/.test(t),
    /checking your browser/.test(t),
    /robot check/.test(t),
    /cf-browser-verification/.test(h),
    /cf-chl/.test(h),
    /cloudflare/.test(h) && /challenge/i.test(h),
    /perimeterx/.test(h) || /px-captcha/.test(h),
    /g-recaptcha-response/.test(h),
    /please enable cookies/.test(h) || /enable javascript/.test(h),
  ]

  const count = signals.filter(Boolean).length

  // Heuristic:
  // - strong: >= 2 signals → clearly a wall
  // - weak: 1 signal *and* page has very little human-readable text
  if (count >= 2) return true

  // quick lightweight text size check
  try {
    const $ = cheerio.load(html)
    const bodyText = $("body").text().replace(/\s+/g, " ").trim()
    const textLen = bodyText.length
    const htmlLen = html.length
    // very little visible text & not a huge HTML → likely interstitial
    if (count === 1 && textLen < 800 && htmlLen < 20000) return true
  } catch {
    // ignore parsing errors; fall through to "not anti-bot"
  }

  return false
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

  // content type that isn't HTML?
  const ctype = res.headers.get("content-type") || ""
  if (!/text\/html|application\/xhtml\+xml/i.test(ctype)) {
    // still try to treat as HTML; some sites mislabel
  }

  const html = await res.text()

  // parse preliminary title for detector
  let title: string | undefined
  try {
    const $ = cheerio.load(html)
    title = $('meta[property="og:title"]').attr("content") || $("title").first().text()?.trim()
  } catch {
    /* ignore; detection falls back to html-only checks */
  }

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

// [LABEL: touched to trigger deploy]
