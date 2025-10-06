// middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Optional: scope middleware
// export const config = { matcher: ["/dashboard/:path*"] };
