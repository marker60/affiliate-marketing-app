// [LABEL: FILE] lib/supabase/client.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-safe Supabase client with anon key.
 * Use this in client components/pages.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL");
if (!anon) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_ANON_KEY");

/** Preconfigured singleton client (recommended for most callers). */
export const supabase = createSupabaseClient(url, anon);

/**
 * Back-compat for legacy imports:
 * Some code does `import { createClient } from "@/lib/supabase/client"`
 * AND calls it with zero args: `const supa = createClient()`.
 * We provide a zero-arg wrapper that returns the singleton.
 */
export function createClient() {
  return supabase;
}

/** If you ever need a raw factory (2-arg), use this named export. */
export const createRawClient = createSupabaseClient;

/** Optional helper for older code paths. */
export function getSupabaseClient() {
  return supabase;
}
