// middleware.ts (root)
import { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware"; // <-- relative path

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// (optional) Limit where middleware runs:
// export const config = { matcher: ["/dashboard/:path*"] };
