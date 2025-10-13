// [LABEL: FILE] lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Browser-safe Supabase client with anon key.
 * Use this in client components/pages.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL");
if (!anon) throw new Error("Missing env NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(url, anon);
