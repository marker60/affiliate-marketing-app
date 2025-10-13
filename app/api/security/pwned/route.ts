// [LABEL: FILE] app/api/security/pwned/route.ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";

type Body = { password?: string };

export async function POST(req: Request) {
  try {
    const { password } = (await req.json()) as Body;
    if (!password || typeof password !== "string") {
      return NextResponse.json({ ok: false, error: "Missing password" }, { status: 400 });
    }

    // SHA1 hash in uppercase hex (HIBP requirement)
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    // K-anonymity: only send first 5 hex characters. Ask for padded response.
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true", "User-Agent": "affiliate-app" },
      // HIBP allows GET; range endpoint is public & free.
      // No API key needed.
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `HIBP error: ${res.status}` }, { status: 502 });
    }

    const text = await res.text();
    // Response is lines of "HASH_SUFFIX:COUNT"
    const compromisedLine = text
      .split("\n")
      .find((line) => line.startsWith(suffix + ":"));

    if (!compromisedLine) {
      return NextResponse.json({ ok: true, compromised: false, count: 0 });
    }
    const count = parseInt(compromisedLine.split(":")[1], 10) || 1;
    return NextResponse.json({ ok: true, compromised: true, count });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
