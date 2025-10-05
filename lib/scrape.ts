// lib/scrape.ts
import { chromium } from "playwright"

export type ScrapeResult = {
  url: string; title?: string; description?: string; bullets?: string[];
  price?: string; specs?: Record<string,string>; html?: string;
}

export async function scrapeProduct(targetUrl: string): Promise<ScrapeResult> {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  	let u = targetUrl.trim();
	if (!/^https?:\/\//i.test(u)) u = "https://" + u;
	await page.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 });

  const title = await page.locator("meta[property='og:title'], title").first().evaluate(el => (el as any).content ?? el.textContent ?? undefined).catch(()=>undefined)
  const description = await page.locator("meta[name='description'], meta[property='og:description']").first().evaluate(el => (el as any).content ?? undefined).catch(()=>undefined)

  const bullets = await page.locator("li").allTextContents().then(arr =>
    arr.map(t => t.trim()).filter(t => t.length>0).slice(0,10)
  ).catch(()=>[])

  const html = await page.content()
  const priceMatch = html.match(/\$[\s]*\d{1,3}(?:[,\d]{0,3})?(?:\.\d{2})?/);
  const price = priceMatch?.[0]

  // naive spec pairs
  const specs: Record<string,string> = {}
  const dt = await page.locator("dt,th").allTextContents().catch(()=>[])
  const dd = await page.locator("dd,td").allTextContents().catch(()=>[])
  dt.slice(0,8).forEach((k,i)=>{ const v = dd[i]?.trim(); if(k && v) specs[k.trim()] = v })

  await browser.close()
  return { url: targetUrl, title: title?.trim(), description: description?.trim(), bullets, price, specs, html }
}
