// app/layout.tsx
// [LABEL: TOP IMPORTS]
import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"
import { ThemeProvider } from "next-themes" // using next-themes (already installed)
import { ThemeToggle } from "@/components/theme-toggle" // your toggle component

// [LABEL: METADATA]
export const metadata: Metadata = {
  title: "Affiliate Marketing App",
  description: "Create and manage affiliate projects and briefs.",
}

// [LABEL: DEFAULT EXPORT — ROOT LAYOUT]
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* [LABEL: BODY — BASE CLASSES] */}
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* [LABEL: THEME PROVIDER] */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* [LABEL: HEADER — APP NAV + THEME] */}
          <header className="border-b">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
              {/* [LABEL: BRAND] */}
              <div className="text-sm font-semibold tracking-tight">
                Affiliate Marketing App
              </div>

              {/* [LABEL: NAV LINKS] */}
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/" className="hover:underline underline-offset-4">Home</Link>
                <Link href="/dev" className="hover:underline underline-offset-4">Dev</Link>
                {/* IMPORTANT: link to the briefs list page at /brief (not /briefs) */}
                <Link href="/brief" className="hover:underline underline-offset-4">Briefs</Link>
              </nav>

              {/* [LABEL: THEME TOGGLE] */}
              <ThemeToggle />
            </div>
          </header>

          {/* [LABEL: PAGE CONTENT] */}
          <main className="min-h-[calc(100vh-3.25rem)]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
