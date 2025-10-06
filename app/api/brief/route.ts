// app/api/brief/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

type Scrape = {
  url: string;
  title?: string;
  desc?: string;
  bullets: string[];
  price?: string;
};

function normalizeUrl(raw: string) {
  const s = raw.trim();
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

async function scrape(rawUrl: string): Promise<Scrape> {
  const url = normalizeUrl(rawUrl);

  // Fetch the HTML (server-side)
  const res = await fetch(url, {
    headers: {
      // helps some sites return richer HTML
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
    // some sites block caching; we don't want stale content anyway
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetch_failed_${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").first().text() ||
    undefined;

  const desc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    undefined;

  // Grab up to 10 reasonable bullet-ish lines
  const bullets = $("li")
    .map((_, el) => $(el).text().trim().replace(/\s+/g, " "))
    .get()
    .filter(Boolean)
    .slice(0, 10);

  // Naive price extractor ($12.34 or $1,234.00)
  const priceMatch = html.match(/\$\s*\d{1,3}(?:[,\d]{3})*(?:\.\d{2})?/);

  return { url, title, desc, bullets, price: priceMatch?.[0] };
}

async function aiBrief(s: Scrape) {
  const prompt = `
Create a G-rated affiliate review brief from this product info.
Return JSON with keys: seo_brief, outline_h2[], pros[], cons[], key_faq[], ftc_disclosure.
URL: ${s.url}
Title: ${s.title ?? ""}
Description: ${s.desc ?? ""}
Price: ${s.price ?? ""}
Bullets: ${s.bullets.join(" | ")}
`.trim();

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  if (!r.ok) throw new Error(`openai_failed_${r.status}`);
  const j = await r.json();

  let content = j.choices?.[0]?.message?.content ?? "{}";
  const trimmed = content.trim();
  if (trimmed.startsWith("```")) {
    // strip ```json fences if present
    const parts = trimmed.split("```");
    content = parts.length >= 3 ? parts[1].replace(/^json\n/i, "") : parts[0];
  }

  let obj: any;
  try {
    obj = JSON.parse(content);
  } catch {
    obj = {
      seo_brief: content,
      outline_h2: [],
      pros: [],
      cons: [],
      key_faq: [],
      ftc_disclosure: "Disclosure: This page uses affiliate links.",
    };
  }

  let seoText = "";
  if (typeof obj.seo_brief === "string") {
    seoText = obj.seo_brief;
  } else if (obj.seo_brief) {
    const t = obj.seo_brief.title ? `Title: ${obj.seo_brief.title}\n` : "";
    const d = obj.seo_brief.meta_description
      ? `Meta: ${obj.seo_brief.meta_description}\n`
      : "";
    const k = Array.isArray(obj.seo_brief.keywords)
      ? `Keywords: ${obj.seo_brief.keywords.join(", ")}`
      : "";
    seoText = `${t}${d}${k}`.trim();
  }

  const brief = `SEO Brief:\n${seoText}\n\nOutline:\n${(obj.outline_h2 || []).join(
    "\n"
  )}`;
  const draft = `${
    obj.ftc_disclosure || "Disclosure: This page uses affiliate links."
  }

Pros:
- ${(obj.pros || []).join("\n- ")}

Cons:
- ${(obj.cons || []).join("\n- ")}

Key FAQ:
- ${(obj.key_faq || []).join("\n- ")}`;

  const title = s.title ?? new URL(s.url).hostname;
  return { brief, draft, title, raw: obj };
}

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
    );

    const form = await req.formData();
    const projectId = String(form.get("projectId") || "");
    const productUrl = String(form.get("productUrl") || "").trim();

    if (!projectId || !productUrl) {
      return NextResponse.json(
        { ok: false, error: "missing_inputs" },
        { status: 400 }
      );
    }

    const s = await scrape(productUrl);
    const { brief, draft, title, raw } = await aiBrief(s);

    // upsert the latest page for this project
    const sel = await supabase
      .from("pages")
      .select("id")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sel.error) {
      return NextResponse.json(
        { ok: false, error: sel.error.message },
        { status: 500 }
      );
    }

    const payload = {
      project_id: projectId,
      url: s.url,
      title,
      brief,
      draft,
      ai_json: raw,
    };

    const resp = sel.data?.id
      ? await supabase.from("pages").update(payload).eq("id", sel.data.id)
      : await supabase.from("pages").insert(payload);

    if (resp.error) {
      return NextResponse.json(
        { ok: false, error: resp.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "failed" },
      { status: 500 }
    );
  }
}
