// [LABEL: FILE] app/l/[slug]/route.ts
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getIP(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return req.headers.get("x-real-ip") || null;
}
function hashIP(ip: string | null) {
  if (!ip) return null;
  const secret = process.env.LINK_IP_HASH_SECRET || "fallback-secret";
  return crypto.createHash("sha256").update(`${ip}:${secret}`).digest("hex");
}

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  const { slug } = ctx.params;

  const { data: link, error } = await supabaseAdmin
    .from("links")
    .select("id, destination_url")
    .eq("slug", slug)
    .single();

  if (error || !link) return new NextResponse("Not Found", { status: 404 });

  const ip = getIP(req);
  const ua = req.headers.get("user-agent") || null;
  const ref = req.headers.get("referer") || null;

  // fire-and-forget insert
  void supabaseAdmin.from("clicks").insert([
    { link_id: link.id, ip_hash: hashIP(ip), user_agent: ua, referrer: ref },
  ]);

  return NextResponse.redirect(link.destination_url, { status: 302 });
}
