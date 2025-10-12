import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function required(name: string, v: string | undefined) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_ANON_KEY = required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Server-side Supabase client (works in API routes, Server Components, Route Handlers).
 * Uses Next.js cookies() to persist the auth session.
 */
export function getSupabaseServer() {
  const store = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // cookie mutation is best-effort; avoid crashing on read-only contexts
        try {
          store.set({ name, value, ...options });
        } catch (_) {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          store.set({ name, value: "", ...options, maxAge: 0 });
        } catch (_) {}
      },
    },
  });
}

/**
 * Backwards compat: some files import { createClient } from "@/lib/supabase/server".
 * Re-export the server client under that name so those imports keep working.
 */
export const createClient = getSupabaseServer;
