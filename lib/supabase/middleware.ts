// lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Edge-safe: refresh Supabase session cookies in middleware */
export async function updateSession(request: NextRequest) {
  // Start with current request context
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Required shape on Edge/middleware
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          // mutate request cookies for this execution
          cookies.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // create fresh response + set outgoing cookies
          supabaseResponse = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Touch auth to refresh session cookies
  await supabase.auth.getUser();

  return supabaseResponse;
}
