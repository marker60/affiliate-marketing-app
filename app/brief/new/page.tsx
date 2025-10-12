// app/brief/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function NewBriefPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [html, setHtml] = useState("");
  const [previewOn, setPreviewOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!html.trim()) {
      setError("HTML is required.");
      return;
    }

    try {
      const res = await fetch("/api/briefs/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          html,
          // only send a real URL, not empty/whitespace
          source_url: sourceUrl.trim() ? sourceUrl.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to save brief.");
        return;
      }

      const id = data?.id || data?.data?.id;
      if (!id) {
        setError("Saved but no ID returned.");
        return;
      }

      // redirect after a brief tick to let UI update
      startTransition(() => {
        router.push(`/brief/${id}`);
      });
    } catch (e: any) {
      setError(e?.message || "Unexpected error.");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">New Brief (From HTML)</h1>

      {error && (
        <div className="rounded border border-red-700 bg-red-900/30 text-red-200 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-300">Title *</span>
          <input
            className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 outline-none"
            placeholder="e.g., Bionaturae Tomatoes, Diced, Organic"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-300">Source URL (optional)</span>
          <input
            className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 outline-none"
            placeholder="https://example.com/product"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-zinc-300">HTML *</span>
          <textarea
            className="min-h-[220px] px-3 py-2 rounded bg-zinc-900 border border-zinc-800 font-mono text-sm outline-none"
            placeholder="Paste full page source HTML here…"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
          onClick={() => setPreviewOn((v) => !v)}
        >
          {previewOn ? "Hide Preview" : "Show Preview"}
        </button>

        <button
          type="button"
          className="px-3 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Save Brief"}
        </button>
      </div>

      {previewOn && (
        <div className="mt-4 rounded border border-zinc-800">
          <div className="px-3 py-2 text-sm text-zinc-400 border-b border-zinc-800">
            HTML preview (rendered)
          </div>
          <div
            className="prose prose-invert max-w-none p-4"
            // NOTE: This is just for quick visual preview of pasted HTML.
            // The server will still normalize and store Markdown.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}
