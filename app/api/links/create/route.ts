// [LABEL: FILE] app/api/links/create/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "node:crypto";

export const runtime = "nodejs";

type Body = {
  destination_url?: string;
  title?: string;
  slug?: string;
  tags?: string[];
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}
function randomSlug(n = 6) {
  return crypto.randomBytes(n).toString("base64url").replace(/_/g, "").slice(0, n);
}

export async function POST(req: Request) {
  try {
    const { destination_url, title, slug, tags } = (await req.json()) as Body;

    if (!destination_url || !/^https?:\/\//i.test(destination_url)) {
      return NextResponse.json({ ok: false, error: "destination_url must start with http(s)://" }, { status: 400 });
    }

    // determine slug
    let desired = (slug ? slugify(slug) : "") || (title ? slugify(title) : "") || randomSlug();
    // ensure unique (retry with tiny suffix)
    for (let i = 0; i < 5; i++) {
      const { data, error } = await supabaseAdmin.from("links").select("id").eq("slug", desired).maybeSingle();
      if (error) throw error;
      if (!data) break;
      desired = `${desired}-${randomSlug(2)}`.slice(0, 32);
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("links")
      .insert([{ slug: desired, destination_url, title: title ?? null, tags: tags ?? null }])
      .select("id, slug")
      .single();

    if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = (req.headers.get("x-forwarded-proto") || "https").split(",")[0];
    const short_url = host ? `${proto}://${host}/l/${inserted.slug}` : `/l/${inserted.slug}`;

    return NextResponse.json({ ok: true, id: inserted.id, slug: inserted.slug, short_url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
