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

/** Preconfigured singleton client (most callers should use this). */
export const supabase = createSupabaseClient(url, anon);

/** Back-compat: some code does `import { createClient } from "@/lib/supabase/client"` */
export const createClient = createSupabaseClient;

/** Optional helper for older code paths. */
export function getSupabaseClient() {
  return supabase;
}
