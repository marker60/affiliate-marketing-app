// [LABEL: FILE] lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 * Use this ONLY on the server (API routes, server actions).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL");
if (!serviceRoleKey) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

/**
 * Backward-compatible helper for older imports.
 * Some routes still do: `import { getSupabaseServer } from "@/lib/supabase/server"`
 */
export function getSupabaseServer() {
  return supabaseAdmin;
}
