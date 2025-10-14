// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Next.js + Supabase App",
  description: "Auth + Briefs tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* Top Navigation */}
        <header className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
            <div className="text-sm font-semibold tracking-tight">Next.js + Supabase App</div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline underline-offset-4">Home</Link>
              {/* IMPORTANT: briefs list route is /brief (singular) */}
              <Link href="/brief" className="hover:underline underline-offset-4">Briefs</Link>
              <Link href="/auth/login" className="hover:underline underline-offset-4">Log in</Link>
              <Link href="/auth/sign-up" className="hover:underline underline-offset-4">Sign up</Link>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-3.25rem)]">{children}</main>
      </body>
    </html>
  );
}
