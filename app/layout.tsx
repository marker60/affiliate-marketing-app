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
          <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
            {/* [LABEL: BRAND] */}
            <div className="text-sm font-medium">Affiliate Marketing App</div>

            {/* [LABEL: NAV LINKS] */}
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/">Home</Link>
              <Link href="/dev">Dev</Link>
              <Link href="/briefs">Briefs</Link>
            </nav>

            {/* [LABEL: THEME TOGGLE] */}
            <ThemeToggle />
          </header>

          {/* [LABEL: PAGE CONTENT] */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
