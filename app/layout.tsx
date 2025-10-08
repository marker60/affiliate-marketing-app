// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

// [LABEL: TOP IMPORTS — NAV]
import Link from "next/link"
// [LABEL: TOP IMPORTS — THEME TOGGLE]  (skip if you already have it)
import { ThemeToggle } from "@/components/theme-toggle"


export const metadata: Metadata = {
  title: "Affiliate Marketing App",
  description: "Create and manage affiliate projects and briefs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          {/* Temporary placement so you can see it working right away */}
          <div className="p-3 border-b">
            <span className="text-xs text-muted-foreground">Theme</span>

          </div>
{/* [LABEL: JSX INSERT — HEADER START] */}
<header className="flex items-center justify-between gap-4 border-b px-4 py-3">
  <div className="text-sm font-medium">Affiliate Marketing App</div>

  {/* simple nav */}
  <nav className="flex items-center gap-4 text-sm">
    <Link href="/">Home</Link>
    <Link href="/dev">Dev</Link>
    <Link href="/briefs">Briefs</Link>
  </nav>

  <ThemeToggle />
</header>
{/* [LABEL: JSX INSERT — HEADER END] */}

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
