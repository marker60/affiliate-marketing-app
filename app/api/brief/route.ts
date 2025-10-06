// app/api/brief/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

type Scrape = {
  url: string;
  title?: string;
  desc?: string;
  bullets: string[];
  price?: string;
};

async function scrape(raw: string): Promise<Scrape> {
  // Ensure a valid URL
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  // Launch Chromium with flags that work on Vercel
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });

  const title = (await page.title())?.trim();

  const desc =
    (await page
      .locator(
        "meta[name=description],meta[property='og:description'],meta[name='twitter:description']"
      )
      .first()
      .getAttribute("content")
      .catch(() => null)) || undefined;

  const bullets = (await page.locator("li").allTextContents())
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  const priceMatch = (await page.content()).match(
    /\$\s*\d{1,3}(?:[,\d]{0,3})?(?:\.\d{2})?/
  );

  await browser.close();

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

  if (!r.ok) throw new Error("openai_failed");

  const j = await r.json();
  let content = j.choices?.[0]?.message?.content ?? "{}";
  const t = content.trim();

  // Strip ```json fences if present
  if (t.startsWith("```")) {
    const parts = t.split("```");
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

  const brief = `SEO Brief:\n${seoText}\n\nOutline:\n${(obj.outline_h2 || []).join("\n")}`;
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
    // Server-side Supabase client (service role stays on server — never expose to client)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Verify owner (optional safety)
    const { data: owner } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .single();
    const uid = owner?.user_id || null;

    // Scrape + brief
    const s = await scrape(productUrl);
    const { brief, draft, title, raw } = await aiBrief(s);

    // Upsert the latest page for this project
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
      user_id: uid,
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
