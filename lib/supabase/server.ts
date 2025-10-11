import { createServerClient } from "@supabase/ssr";
import type { CookiesFn } from "@supabase/ssr/dist/module/types";

export function getSupabaseServer(cookies?: CookiesFn) {
  // Works both in routes and server components
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookies ?? {
        get(name: string) {
          // no-op cookie store for API routes where we don't need session
          return undefined as any;
        },
        set() {},
        remove() {},
      },
    }
  );
}
