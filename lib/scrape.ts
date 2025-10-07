// lib/scrape.ts — Cheerio-only scraper (no Playwright)
import * as cheerio from "cheerio"

export type ScrapeResult = {
  url: string
  title?: string
  description?: string
  bullets?: string[]
  text?: string
}

/**
 * Lightweight HTML scrape using fetch + cheerio.
 * Works on Vercel without Playwright.
 */
export async function scrape(url: string): Promise<ScrapeResult> {
  const res = await fetch(url, {
    headers: {
      // Friendly UA helps some sites return full HTML
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  })

  const html = await res.text()
  const $ = cheerio.load(html)

  const title =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    undefined

  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    undefined

  // Collect simple bullet text (limit to keep payload small)
  const bullets = $("li")
    .slice(0, 20)
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)

  // Light page text (first ~10k chars from <p>)
  const text = $("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join("\n")
    .slice(0, 10_000)

  return { url, title, description, bullets, text }
}

export default scrape
