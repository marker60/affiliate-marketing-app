// lib/supabase/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Edge-safe: refreshes Supabase session cookies on each request */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Parameters<typeof response.cookies.set>[1]) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Parameters<typeof response.cookies.set>[1]) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Touch the auth endpoint to refresh session on the edge
  await supabase.auth.getUser();

  return response;
}
