"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- shadcn/ui bits (adjust imports to your setup) ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

// --- icons (lucide-react) ---
import {
  ClipboardCopy,
  Check,
  ExternalLink,
  Trash2,
  RefreshCcw,
  Link as LinkIcon,
  Search,
} from "lucide-react";

// --- Types ---
type Brief = {
  id: string;
  url?: string | null;
  title?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// NOTE: This page assumes a GET list endpoint at /api/brief?list=1
// and a DELETE endpoint at /api/brief?id=BRIEF_ID
// Your existing app/api/brief/route.ts likely handles GET/DELETE;
// if not, you can add simple handlers, but this UI will work as soon as
// those endpoints return JSON arrays of briefs.

export default function BriefsPage() {
  const [briefs, setBriefs] = React.useState<Brief[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [copyingId, setCopyingId] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchBriefs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brief?list=1", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Brief[] = await res.json();
      setBriefs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBriefs();
  }, [fetchBriefs]);

  const onDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/brief?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBriefs((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Deleted", description: `Brief ${id} removed.` });
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    }
  };

  const onCopyId = async (id: string) => {
    setCopyingId(id);
    const ok = await copyToClipboard(id);
    setCopyingId(null);
    if (ok) {
      toast({ title: "Copied", description: `ID ${id} copied to clipboard.` });
    } else {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  const filtered = React.useMemo(() => {
    if (!query.trim()) return briefs;
    const q = query.toLowerCase();
    return briefs.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        (b.url ?? "").toLowerCase().includes(q) ||
        (b.title ?? "").toLowerCase().includes(q)
    );
  }, [briefs, query]);

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Briefs</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push("/dev")}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Dev
          </Button>
          <Button onClick={fetchBriefs}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Recent Briefs
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60" />
              <Input
                className="pl-8"
                placeholder="Filter by ID / URL / Title"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm opacity-70">Loading…</div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">
              Error: {error}. Try Refresh.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm opacity-70">No briefs yet.</div>
          ) : (
            <ul className="divide-y">
              {filtered.map((b) => (
                <li key={b.id} className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    {/* Left: meta */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {b.id.slice(0, 8)}…
                        </Badge>
                        {b.created_at && (
                          <span className="text-xs opacity-70">
                            {new Date(b.created_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {b.title ? (
                        <div className="mt-1 text-sm line-clamp-1">{b.title}</div>
                      ) : null}
                      {b.url ? (
                        <div
                          className="mt-1 text-xs opacity-80 break-words"
                          title={b.url}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {b.url}
                        </div>
                      ) : null}
                    </div>

                    {/* Right: actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      {/* NEW: Open in /brief/[id] (explicit) */}
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/brief/${b.id}`} prefetch>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Link>
                      </Button>

                      {/* NEW: Copy ID */}
                      <Button
                        size="sm"
                        onClick={() => onCopyId(b.id)}
                        disabled={copyingId === b.id}
                        aria-label={`Copy ID ${b.id}`}
                      >
                        {copyingId === b.id ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <ClipboardCopy className="mr-2 h-4 w-4" />
                        )}
                        {copyingId === b.id ? "Copied" : "Copy ID"}
                      </Button>

                      {/* Existing: Delete */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(b.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs opacity-60">
        Tip: If a site blocks scraping (403), open the page, copy{" "}
        <code className="font-mono">document.documentElement.outerHTML</code>, then use{" "}
        <span className="font-medium">Brief &rarr; From HTML</span>.
      </p>
    </div>
  );
}
