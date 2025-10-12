// app/brief/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBriefPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!title.trim() || !html.trim()) {
      setErr("Title and HTML are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/brief/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          source_url: sourceUrl.trim() || null,
          html,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error || `Save failed (${res.status})`);
      }

      // Route to the list (safer than /brief/[id] while we harden that page)
      router.push("/brief");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">New Brief</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm text-zinc-400">Title *</label>
          <input
            className="w-full rounded border border-zinc-700 bg-transparent p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product name or page title"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-zinc-400">Original URL (optional)</label>
          <input
            className="w-full rounded border border-zinc-700 bg-transparent p-2"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/product"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-zinc-400">HTML *</label>
          <textarea
            className="w-full h-64 rounded border border-zinc-700 bg-transparent p-2 font-mono text-sm"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<html>…</html>"
          />
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Brief"}
        </button>
      </form>
    </div>
  );
}
