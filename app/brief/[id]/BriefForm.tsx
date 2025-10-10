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
import { Loader2, Save, Eye, Link as LinkIcon } from "lucide-react";

type Props = {
  /** Optional: seed URL for From URL tab */
  seedUrl?: string;
};

export default function BriefForm({ seedUrl = "" }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  // Tabs
  const [tab, setTab] = React.useState<"url" | "html">("url");

  // From URL
  const [url, setUrl] = React.useState(seedUrl);
  const [fetching, setFetching] = React.useState(false);

  // From HTML
  const [rawHtml, setRawHtml] = React.useState("");
  const [previewMd, setPreviewMd] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // --- Helpers ---
  const fetchFromUrl = async () => {
    if (!url.trim()) {
      toast({ title: "Missing URL", description: "Enter a URL first." });
      return;
    }
    setFetching(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      // Expect backend to create & return the new brief id
      if (data?.id) {
        toast({ title: "Created", description: "Brief saved from URL." });
        router.push(`/brief/${data.id}`);
      } else {
        toast({
          title: "Fetched",
          description: "Content generated but not saved by API.",
        });
      }
    } catch (e: any) {
      toast({
        title: "Fetch failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const generateFromHtml = async () => {
    if (!rawHtml.trim()) {
      toast({ title: "Missing HTML", description: "Paste page source first." });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No network scrape — server parses HTML and returns markdown preview
        body: JSON.stringify({ html: rawHtml, preview: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setPreviewMd(data?.markdown ?? "");
      if (!data?.markdown) {
        toast({
          title: "No preview returned",
          description: "API did not send markdown; you can still try Save.",
        });
      }
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
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
        // Tell API to persist; title is optional and can be derived server-side
        body: JSON.stringify({ html: rawHtml, save: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      if (!data?.id) throw new Error("API did not return a brief id.");
      toast({ title: "Saved", description: "Brief created from HTML." });
      router.push(`/brief/${data.id}`);
    } catch (e: any) {
      toast({
        title: "Save failed",
        description:
          e?.message ??
          "The API may not support saving HTML yet. I can wire that next.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Create a Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="html">From HTML</TabsTrigger>
            </TabsList>

            {/* --- FROM URL --- */}
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
              <p className="text-xs opacity-70">
                If a site blocks scraping (403), use the **From HTML** tab.
              </p>
            </TabsContent>

            {/* --- FROM HTML --- */}
            <TabsContent value="html" className="space-y-4 pt-4">
              <Textarea
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                placeholder="Paste full page HTML (document.documentElement.outerHTML)…"
                className="min-h-[220px] font-mono text-xs"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateFromHtml} disabled={generating}>
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
                {/* NEW: SAVE BUTTON */}
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
