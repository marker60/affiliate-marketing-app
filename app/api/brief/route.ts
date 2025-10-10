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
type Result = ScrapeResult | ErrorResult

// [LABEL: CONSTANTS — PRIMARY + FALLBACK REQUEST HEADERS]
const UA_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

const HEADERS_PRIMARY = (origin?: string) => ({
  "user-agent": UA_DESKTOP,
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  ...(origin ? { referer: origin } : {}),
})

const HEADERS_FALLBACK = (origin?: string) => ({
  "user-agent": UA_MOBILE,
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "upgrade-insecure-requests": "1",
  ...(origin ? { referer: origin } : {}),
})

// [LABEL: TRACKING PARAM KEYS — STRIP LIST]
const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "cnxclid",
  "mc_eid",
  "irgwc",
  "irclickid",
  "affid",
  "aff",
  "ref",
]

// [LABEL: UTILS — STRIP TRACKING QUERY PARAMS]
function stripTrackingParams(inputUrl: string): string {
  try {
    const u = new URL(inputUrl)
    const before = u.toString()
    // if query includes any tracking keys, drop the WHOLE query (simplest + safest)
    const hasTracking =
      [...u.searchParams.keys()].some((k) => TRACKING_KEYS.includes(k.toLowerCase())) ||
      u.search.includes("utm_")
    if (hasTracking) {
      u.search = "" // nuke query
    }
    const after = u.toString()
    return after
  } catch {
    // if invalid URL, return original
    return inputUrl
  }
}

// [LABEL: UTILS — SLEEP]
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// [LABEL: UTILS — FETCH WITH TIMEOUT]
async function fetchWithTimeout(url: string, headers: Record<string, string>, ms = 15000) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, {
      headers,
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
    })
  } finally {
    clearTimeout(t)
  }
}

// [LABEL: BOT-WALL DETECTOR (CONSERVATIVE)]
function looksLikeAntiBot(html: string, title: string | undefined): boolean {
  const h = html.toLowerCase()
  const t = (title || "").toLowerCase()

  const signals = [
    /just a moment/.test(t),
    /checking your browser/.test(t),
    /robot check/.test(t),
    /cf-browser-verification/.test(h),
    /cf-chl/.test(h),
    /challenge/.test(h) && /cloudflare/.test(h),
    /perimeterx/.test(h) || /px-captcha/.test(h),
    /g-recaptcha-response/.test(h),
    /please enable cookies/.test(h),
    /enable javascript/.test(h),
  ]
  const count = signals.filter(Boolean).length
  if (count >= 2) return true

  // Weak signal + tiny page → likely interstitial
  try {
    const $ = cheerio.load(html)
    const bodyText = $("body").text().replace(/\s+/g, " ").trim()
    const textLen = bodyText.length
    const htmlLen = html.length
    if (count === 1 && textLen < 800 && htmlLen < 20000) return true
  } catch {
    /* ignore */
  }
  return false
}

// [LABEL: ACCESS-DENIED HEURISTIC]
function isAccessDeniedLike(title: string | undefined, text: string) {
  const t = (title || "").toLowerCase()
  const b = text.toLowerCase()
  return (
    /access denied|forbidden|not authorized/.test(t + " " + b) ||
    /robot|bot|automated|blocked/.test(b)
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
    text: bodyText.slice(0, 60_000),
  }
}

// [LABEL: CORE — TRY SEQUENCE WITH RETRIES + STRIP-QUERY FALLBACK]
async function tryScrapeOnce(targetUrl: string, headers: Record<string, string>): Promise<Response> {
  return fetchWithTimeout(targetUrl, headers, 18000)
}

async function scrape(url: string): Promise<Result> {
  // [LABEL: PREP — REFERER + CLEAN URL CANDIDATE]
  let referer: string | undefined
  try {
    const u = new URL(url)
    referer = `${u.origin}/`
  } catch {/* ignore */}

  const cleanedUrl = stripTrackingParams(url)
  const candidates = [url, cleanedUrl].filter((v, i, a) => a.indexOf(v) === i) // de-dup

  // [LABEL: TRY EACH CANDIDATE URL]
  for (const candidate of candidates) {
    // Attempt A: desktop
    let res: Response
    try {
      res = await tryScrapeOnce(candidate, HEADERS_PRIMARY(referer))
    } catch (e: any) {
      // network abort → try next candidate
      continue
    }

    // Attempt A2: if 403/503, try mobile headers
    if (res.status === 403 || res.status === 503) {
      await sleep(700)
      try {
        res = await tryScrapeOnce(candidate, HEADERS_FALLBACK(referer))
      } catch (e: any) {
        // next candidate
        continue
      }
    }

    // read html if looks HTML or 403 (might still include HTML)
    const ctype = (res.headers.get("content-type") || "").toLowerCase()
    const isHtmlLike = /text\/html|application\/xhtml\+xml/.test(ctype) || res.status === 403
    let html = ""
    if (isHtmlLike) {
      try {
        html = await res.text()
      } catch {/* ignore */}
    }

    // if OK → parse normally (unless bot wall)
    if (res.ok) {
      const $ = cheerio.load(html || "")
      const title =
        $('meta[property="og:title"]').attr("content") ||
        $("title").first().text()?.trim() ||
        undefined
      if (html && looksLikeAntiBot(html, title)) {
        return { ok: false, error: "blocked_by_anti_bot", details: title || "interstitial" }
      }
      return parseHtml(candidate, html || "")
    }

    // if 403 but HTML looks like a real product page, parse anyway
    if (res.status === 403 && html) {
      try {
        const $ = cheerio.load(html)
        const title =
          $('meta[property="og:title"]').attr("content") || $("title").first().text()?.trim()
        const bodyText = $("body").text().replace(/\s+/g, " ").trim()
        const textLen = bodyText.length
        if (!isAccessDeniedLike(title, bodyText) && textLen > 1200 && !looksLikeAntiBot(html, title)) {
          return parseHtml(candidate, html)
        }
      } catch {/* ignore */}
    }

    // non-OK and not salvageable → try next candidate
  }

  // [LABEL: TOTAL FAIL]
  return { ok: false, error: "http_403", details: "after retries" }
}

// [LABEL: HANDLERS]
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
      500
    return NextResponse.json(result, { status })
  }
  return NextResponse.json(result as ScrapeResult, { status: 200 })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const url = (body?.url as string) || ""
  if (!url) {
    return NextResponse.json({ ok: false, error: "missing_url" }, { status: 400 })
  }
  const result = await scrape(url)
  if ("ok" in result && result.ok === false) {
    const status =
      result.error === "blocked_by_anti_bot" ? 403 :
      result.error.startsWith("http_") ? parseInt(result.error.slice(5)) || 500 :
      500
    return NextResponse.json(result, { status })
  }
  return NextResponse.json(result as ScrapeResult, { status: 200 })
}
