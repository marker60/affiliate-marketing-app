import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

// ── supabase (no cookies; avoids 400s) ────────────────────────────────────────
function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── HTML → markdown (more tolerant) ───────────────────────────────────────────
function htmlToMarkdown(html: string) {
  const $raw = cheerio.load(html);

  // Clean noise early
  $raw("script,noscript,style,template,iframe").remove();

  const title =
    ($raw("title").first().text() || "").trim() ||
    ($raw('meta[property="og:title"]').attr("content") || "").trim() ||
    ($raw('meta[name="twitter:title"]').attr("content") || "").trim();

  const metaDesc =
    ($raw('meta[name="description"]').attr("content") || "").trim();

  // Prefer article/main; fallback body
  const mainHtml =
    $raw("article").first().html() ??
    $raw("main").first().html() ??
    $raw('[role="main"]').first().html() ??
    $raw("body").html() ??
    "";

  const $ = cheerio.load(mainHtml);
  const out: string[] = [];

  // Headings, paragraphs, list items
  $("h1,h2,h3,p,li,blockquote").each((_, el) => {
    const tag = $(el).prop("tagName")?.toLowerCase();
    const text = $(el).text().replace(/\s+\n/g, "\n").replace(/\s+/g, " ").trim();
    if (!text) return;
    if (tag === "h1") out.push(`# ${text}`);
    else if (tag === "h2") out.push(`## ${text}`);
    else if (tag === "h3") out.push(`### ${text}`);
    else if (tag === "li") out.push(`- ${text}`);
    else out.push(text);
  });

  // If very little was captured, also sample texty <div>s
  if (out.length < 6) {
    $("div").each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t && t.length >= 80) out.push(t);
    });
  }

  // Links (append)
  const links = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = ($(a).attr("href") || "").trim();
    const txt = $(a).text().replace(/\s+/g, " ").trim();
    if (!href || /^(#|mailto:|javascript:)/i.test(href)) return;
    links.add(txt ? `[${txt}](${href})` : `<${href}>`);
  });

  // Deduplicate, trim, and cap size
  const uniq = Array.from(new Set(out)).slice(0, 400);
  const md =
    (title ? `# ${title}\n\n` : "") +
    (metaDesc ? `> ${metaDesc}\n\n` : "") +
    uniq.join("\n\n") +
    (links.size ? `\n\n---\n**Links:**\n\n${[...links].slice(0, 100).join("\n")}\n` : "");

  return { title: title || undefined, markdown: md.trim() };
}

// ── GET: list / single ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const list = searchParams.get("list");

  const client = sb();

  // list=1 or list=true
  if (list && /^(1|true)$/i.test(list)) {
    const { data, error } = await client
      .from("briefs")
      .select("id,url,title,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (id) {
    const { data, error } = await client.from("briefs").select("*").eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ ok: true });
}

// ── DELETE: by id ─────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const client = sb();
  const { error } = await client.from("briefs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// ── POST: URL or pasted HTML (preview / save) ─────────────────────────────────
export async function POST(req: NextRequest) {
  const client = sb();
  const body = await req.json().catch(() => ({}));
  const { url, html, preview, save } = body as {
    url?: string;
    html?: string;
    preview?: boolean;
    save?: boolean;
  };

  // A) From URL → fetch → parse → save
  if (url?.trim()) {
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        cache: "no-store",
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: `Fetch failed: HTTP ${res.status}` },
          { status: 502 }
        );
      }
      const pageHtml = await res.text();
      const { title, markdown } = htmlToMarkdown(pageHtml);

      const { data, error } = await client
        .from("briefs")
        .insert([{ url, title, markdown, html: pageHtml }])
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ id: data?.id, title, markdown });
    } catch (e: any) {
      return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
  }

  // B) From pasted HTML
  if (html?.trim()) {
    const { title, markdown } = htmlToMarkdown(html);

    if (preview && !save) {
      return NextResponse.json({ title, markdown });
    }

    if (save) {
      const { data, error } = await client
        .from("briefs")
        .insert([{ url: null, title, markdown, html }])
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ id: data?.id, title, markdown });
    }

    return NextResponse.json({ title, markdown });
  }

  return NextResponse.json({ error: "Provide { url } or { html }" }, { status: 400 });
}
