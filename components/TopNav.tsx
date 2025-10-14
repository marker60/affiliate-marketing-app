// [LABEL: FILE] components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (pathname?.startsWith(href) ? "bg-gray-100 font-medium" : "hover:bg-gray-50");

  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-base font-semibold">App</Link>
          <nav className="ml-2 flex gap-1">
            <Link href="/brief" className={`px-3 py-2 rounded-lg text-sm ${isActive("/brief")}`}>Briefs</Link>
          </nav>
        </div>
        <nav className="flex gap-1">
          <Link href="/auth/login" className="px-3 py-2 rounded-lg text-sm hover:bg-gray-50">Log in</Link>
          <Link href="/auth/sign-up" className="px-3 py-2 rounded-lg text-sm border hover:bg-gray-50">Sign up</Link>
        </nav>
      </div>
    </header>
  );
}
