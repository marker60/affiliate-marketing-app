import { createBrowserClient } from "@supabase/ssr";

function required(name: string, v: string | undefined) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_ANON_KEY = required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Only use in client components */
export function getSupabaseBrowser() {
  // In case someone imports this on the server by mistake, don’t explode:
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowser() can only be used in the browser");
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
