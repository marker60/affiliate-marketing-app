import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

// Fallback title from URL when document has none
function titleFromUrl(u?: string) {
  if (!u) return undefined;
  try {
    const url = new URL(u);
    const seg = url.pathname.split("/").filter(Boolean).pop() || url.hostname;
    const clean = decodeURIComponent(seg)
      .replace(/\.(html?|php|aspx?)$/i, "")
      .replace(/[_\-+]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    // Capitalize words
    return clean
      ? clean.replace(/\b\w/g, (m) => m.toUpperCase()).slice(0, 140)
      : url.hostname;
  } catch {
    return undefined;
  }
}

function htmlToMarkdown(html: string) {
  const $raw = cheerio.load(html);
  $raw("script,noscript,style,template,iframe").remove();

  let title =
    ($raw("title").first().text() || "").trim() ||
    ($raw('meta[property="og:title"]').attr("content") || "").trim() ||
    ($raw('meta[name="twitter:title"]').attr("content") || "").trim();

  const metaDesc = ($raw('meta[name="description"]').attr("content") || "").trim();

  const mainHtml =
    $raw("article").first().html() ??
    $raw("main").first().html() ??
    $raw('[role="main"]').first().html() ??
    $raw("body").html() ??
    "";

  const $ = cheerio.load(mainHtml);
  const chunks: string[] = [];

  $("h1,h2,h3,p,li,blockquote").each((_, el) => {
    const tag = $(el).prop("tagName")?.toLowerCase();
    const text = $(el).text().replace(/\s+\n/g, "\n").replace(/\s+/g, " ").trim();
    if (!text) return;
    if (tag === "h1") chunks.push(`# ${text}`);
    else if (tag === "h2") chunks.push(`## ${text}`);
    else if (tag === "h3") chunks.push(`### ${text}`);
    else if (tag === "li") chunks.push(`- ${text}`);
    else chunks.push(text);
  });

  if (!title) {
    const candidate =
      $("h1").first().text().trim() ||
      $("h2").first().text().trim() ||
      (chunks.find((c) => c.length > 40) ?? "");
    if (candidate) title = candidate.replace(/^#+\s*/, "").slice(0, 140);
  }

  if (chunks.length < 6) {
    $("div").each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t && t.length >= 80) chunks.push(t);
    });
  }

  const links = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = ($(a).attr("href") || "").trim();
    const txt = $(a).text().replace(/\s+/g, " ").trim();
    if (!href || /^(#|mailto:|javascript:)/i.test(href)) return;
    links.add(txt ? `[${txt}](${href})` : `<${href}>`);
  });

  const uniq = Array.from(new Set(chunks)).slice(0, 400);
  const md =
    (title ? `# ${title}\n\n` : "") +
    (metaDesc ? `> ${metaDesc}\n\n` : "") +
    uniq.join("\n\n") +
    (links.size ? `\n\n---\n**Links:**\n\n${[...links].slice(0, 100).join("\n")}\n` : "");

  return { title: title || undefined, markdown: md.trim() };
}

// GET: supports list=1|true or list=<number>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const listParam = searchParams.get("list");
  const client = sb();

  if (listParam) {
    const limit =
      /^(true|1)$/i.test(listParam) ? 50 : Math.max(1, Math.min(100, parseInt(listParam, 10) || 5));

    const { data, error } = await client
      .from("briefs")
      .select("id,url,title,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

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

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const client = sb();
  const { error } = await client.from("briefs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const client = sb();
  const body = await req.json().catch(() => ({}));
  const { url, html, preview, save } = body as {
    url?: string;
    html?: string;
    preview?: boolean;
    save?: boolean;
  };

  // A) From URL
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
      let { title, markdown } = htmlToMarkdown(pageHtml);
      if (!title) title = titleFromUrl(url); // fallback

      // Try full insert, then minimal if schema lacks columns
      const full = await client
        .from("briefs")
        .insert([{ url, title, markdown, html: pageHtml }])
        .select("id")
        .single();

      if (full.error) {
        const minimal = await client
          .from("briefs")
          .insert([{ url, title }])
          .select("id")
          .single();
        if (minimal.error)
          return NextResponse.json({ error: minimal.error.message }, { status: 500 });
        return NextResponse.json({ id: minimal.data?.id, title, markdown, note: "Saved with minimal schema." });
      }

      return NextResponse.json({ id: full.data?.id, title, markdown });
    } catch (e: any) {
      return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
  }

  // B) From pasted HTML
  if (html?.trim()) {
    let { title, markdown } = htmlToMarkdown(html);

    if (preview && !save) {
      return NextResponse.json({ title, markdown });
    }

    if (save) {
      // No URL; synthesize a generic title if needed
      if (!title) title = "Untitled Brief";

      const full = await client
        .from("briefs")
        .insert([{ url: null, title, markdown, html }])
        .select("id")
        .single();

      if (full.error) {
        const minimal = await client
          .from("briefs")
          .insert([{ url: null, title }])
          .select("id")
          .single();
        if (minimal.error)
          return NextResponse.json({ error: minimal.error.message }, { status: 500 });
        return NextResponse.json({ id: minimal.data?.id, title, markdown, note: "Saved with minimal schema." });
      }

      return NextResponse.json({ id: full.data?.id, title, markdown });
    }

    return NextResponse.json({ title, markdown });
  }

  return NextResponse.json({ error: "Provide { url } or { html }" }, { status: 400 });
}
