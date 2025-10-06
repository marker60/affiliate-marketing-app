// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Marketing App",
  description: "Create and manage affiliate projects and briefs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Tailwind's default font stack will be used (no Geist import needed) */}
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        {/* If you want Vercel Analytics later, install @vercel/analytics and add:
            import { Analytics } from "@vercel/analytics/react";
            <Analytics />
         */}
      </body>
    </html>
  );
}
