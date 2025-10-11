import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";

// Minimal cookie options compatible with @supabase/ssr
type CookieOptions = {
  domain?: string;
  path?: string;
  maxAge?: number;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  httpOnly?: boolean;
};

export type CookieHandler = {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  remove(name: string, options?: CookieOptions): void;
};

/**
 * Server-side Supabase client that works in:
 * - Route handlers (app/api/**/route.ts)
 * - Server Components
 * - Server Actions
 */
export function getSupabaseServer(cookiesArg?: CookieHandler) {
  const handler: CookieHandler =
    cookiesArg ??
    (() => {
      const store = nextCookies();
      return {
        get: (name) => store.get(name)?.value,
        set: (name, value, options) => {
          try {
            // In route handlers, this is writable
            store.set(name, value, options as any);
          } catch {
            // In non-writable contexts, ignore silently
          }
        },
        remove: (name, options) => {
          try {
            store.set(name, "", { ...(options as any), maxAge: 0 });
          } catch {
            // Ignore in non-writable contexts
          }
        },
      };
    })();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: handler.get,
      set: handler.set,
      remove: handler.remove,
    },
  });
}
