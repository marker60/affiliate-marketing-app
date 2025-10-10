"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Save, Eye, Link as LinkIcon, Bug } from "lucide-react";

export default function QuickBriefPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [tab, setTab] = React.useState<"url" | "html">("html");

  // From URL
  const [url, setUrl] = React.useState("");
  const [fetching, setFetching] = React.useState(false);

  // From HTML
  const [rawHtml, setRawHtml] = React.useState("");
  const [previewMd, setPreviewMd] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // DEBUG: last server response
  const [lastResponse, setLastResponse] = React.useState<any>(null);

  const previewFromHtml = async () => {
    if (!rawHtml.trim()) {
      toast({ title: "Missing HTML", description: "Paste page source first." });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: rawHtml, preview: true }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      setLastResponse({ status: res.status, data });
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setPreviewMd(data?.markdown ?? "");
      toast({ title: "Preview ready" });
    } catch (e: any) {
      toast({
        title: "Preview failed",
        description: String(e?.message || e),
        variant: "destructive",
      });
      setPreviewMd("");
    } finally {
      setGenerating(false);
    }
  };

  const saveFromHtml = async () => {
    if (!rawHtml.trim()) {
      toast({ title: "Nothing to save", description: "Paste HTML first." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: rawHtml, save: true }),
        cache: "no-store",
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      setLastResponse({ status: res.status, data });
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);

      const id = data?.id as string | undefined;
      if (!id) {
        throw new Error(
          `API returned 200 but no id. Payload: ${JSON.stringify(data).slice(0, 2000)}`
        );
      }
      toast({ title: "Saved", description: `Brief ${id} created.` });
      // Ensure navigation even if history behaves oddly
      router.replace(`/brief/${id}`);
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: String(e?.message || e),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchFromUrl = async () => {
    const clean = url.trim();
    if (!clean) {
      toast({ title: "Missing URL", description: "Paste a URL first." });
      return;
    }
    setFetching(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clean }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      setLastResponse({ status: res.status, data });
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      const id = data?.id as string | undefined;
      if (!id) throw new Error("API did not return an id.");
      toast({ title: "Saved", description: "Brief created from URL." });
      router.replace(`/brief/${id}`);
    } catch (e: any) {
      toast({
        title: "Fetch failed",
        description: String(e?.message || e),
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="html">From HTML</TabsTrigger>
            </TabsList>

            {/* FROM URL */}
            <TabsContent value="url" className="space-y-3 pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoComplete="off"
                />
                <Button onClick={fetchFromUrl} disabled={fetching}>
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
            </TabsContent>

            {/* FROM HTML */}
            <TabsContent value="html" className="space-y-4 pt-4">
              <Textarea
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                placeholder="Paste full page HTML (document.documentElement.outerHTML)…"
                className="min-h-[220px] font-mono text-xs"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={previewFromHtml} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preview
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Preview Markdown
                    </>
                  )}
                </Button>
                <Button onClick={saveFromHtml} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Brief
                    </>
                  )}
                </Button>
                {lastResponse ? (
                  <span
                    title={JSON.stringify(lastResponse, null, 2)}
                    className="inline-flex items-center text-xs opacity-70"
                  >
                    <Bug className="mr-1 h-3 w-3" />
                    API: {lastResponse.status}
                  </span>
                ) : null}
              </div>

              {previewMd ? (
                <div className="rounded-md border p-4">
                  <div className="mb-2 text-xs font-medium opacity-70">
                    Markdown Preview
                  </div>
                  <article className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {previewMd}
                    </ReactMarkdown>
                  </article>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
