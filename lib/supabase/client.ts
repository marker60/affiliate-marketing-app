import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith("http")) {
    console.error("[v0] Missing or invalid Supabase environment variables")
    console.error("[v0] Please configure Supabase integration in Project Settings")
    throw new Error(
      "Supabase is not configured. Please add the Supabase integration in Project Settings (gear icon in top right).",
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
