"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

// icons
import { Link as LinkIcon, Loader2, ExternalLink, RefreshCcw } from "lucide-react";

// types
type BriefRow = {
  id: string;
  url: string | null;
  title: string | null;
  created_at: string | null;
};

export default function DevPage() {
  const router = useRouter();
  const { toast } = useToast();

  // URL tester
  const [url, setUrl] = React.useState("");
  const [fetching, setFetching] = React.useState(false);

  // Last 5
  const [rows, setRows] = React.useState<BriefRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  const loadLast5 = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/brief?list=5", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: BriefRow[] = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadLast5();
  }, [loadLast5]);

  const onFetchFromUrl = async () => {
    const clean = url.trim();
    if (!clean) {
      toast({ title: "Missing URL", description: "Paste a product/article URL first." });
      return;
    }
    setFetching(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }
      const id = data?.id as string | undefined;
      const title = (data?.title as string | undefined) || "(untitled)";
      toast({ title: "Saved", description: `Brief created: ${title}` });
      if (id) {
        // refresh list and jump to the brief
        loadLast5();
        router.push(`/brief/${id}`);
      }
    } catch (e: any) {
      // show a friendlier hint when we can’t derive a title
      const msg = String(e?.message || e);
      toast({
        title: "Fetch failed",
        description:
          msg.includes("Fetch failed")
            ? `${msg}. If the site blocks requests (403), open the page, copy document.documentElement.outerHTML and use Quick Brief (From HTML).`
            : msg,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dev Tools</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/brief/quick">
              <ExternalLink className="mr-2 h-4 w-4" />
              Quick Brief (From HTML)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/briefs">
              <ExternalLink className="mr-2 h-4 w-4" />
              All Briefs
            </Link>
          </Button>
        </div>
      </div>

      {/* Brief Tester */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Brief Tester (From URL)</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/product-or-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoComplete="off"
            />
            <Button onClick={onFetchFromUrl} disabled={fetching}>
              {fetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" /> Fetch & Save
                </>
              )}
            </Button>
          </div>
          <p className="text-xs opacity-70">
            Tip: If a site blocks scraping (403), click <span className="font-medium">Quick Brief</span> above and use
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">document.documentElement.outerHTML</code>.
          </p>
        </CardContent>
      </Card>

      {/* Last 5 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Last 5 Briefs</CardTitle>
            <Button size="sm" variant="secondary" onClick={loadLast5}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm opacity-70">Loading…</div>
          ) : err ? (
            <div className="p-6 text-sm text-destructive">Error: {err}. Try Refresh.</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm opacity-70">No briefs yet.</div>
          ) : (
            <ul className="divide-y">
              {rows.map((b) => (
                <li key={b.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {b.id.slice(0, 8)}…
                        </Badge>
                        <span className="text-xs opacity-70">
                          {b.created_at ? new Date(b.created_at).toLocaleString() : ""}
                        </span>
                      </div>
                      <div className="mt-1 text-sm line-clamp-1">
                        {b.title || "(untitled)"}
                      </div>
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
                    <div className="shrink-0">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/brief/${b.id}`} prefetch>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
