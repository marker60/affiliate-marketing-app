import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseServer() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: any) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // non-writable context (OK in RSC); ignore
        }
      },
      remove(name: string, options?: any) {
        try {
          cookieStore.set(name, "", { ...(options ?? {}), maxAge: 0 });
        } catch {
          // non-writable context; ignore
        }
      },
    },
  });
}
