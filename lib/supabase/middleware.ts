// lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Edge-safe: refresh Supabase session cookies in middleware */
export async function updateSession(request: NextRequest) {
  // Start with the current request context
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // or PUBLISHABLE key if you use that
    {
      cookies: {
        // Required in @supabase/ssr for Edge/middleware
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update the incoming request cookies (for this run)
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });

          // Create a fresh response that carries the updated cookies out
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Touch auth to ensure session refresh on each request (Edge-safe)
  await supabase.auth.getUser();

  // IMPORTANT: return the supabaseResponse we mutated above
  return supabaseResponse;
}
