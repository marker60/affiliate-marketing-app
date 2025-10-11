import { headers } from "next/headers";

/** Build an absolute origin for server-side fetches. */
export function getBaseUrl(): string {
  // Prefer explicit env if you’ve set it in Vercel
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  // Otherwise infer from request headers (works on Vercel + dev)
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
