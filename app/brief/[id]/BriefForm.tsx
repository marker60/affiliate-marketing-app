// [LABEL: FILE] app/brief/[id]/BriefForm.tsx
"use client";

import * as React from "react";

type Brief = {
  id: string;
  title: string;
  source_url?: string | null;
  html?: string | null;
  summary?: string | null;
  notes?: string | null;
  status?: "new" | "draft" | "ready" | "archived";
  tags?: string[] | null;
};

export default function BriefForm({ id }: { id: string }) {
  const [brief, setBrief] = React.useState<Brief | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/brief/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Failed to load brief");
        if (!cancelled) setBrief(json.item as Brief);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function save(patch: Partial<Brief>) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/brief/save`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Save failed");
      setMessage("Saved!");
      setBrief((b) => (b ? { ...b, ...patch } as Brief : b));
      setTimeout(() => setMessage(null), 1500);
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border p-4">
        <h1 className="text-2xl font-bold">Draft</h1>
        <p className="text-red-600">Couldn’t load this draft: {error}</p>
      </div>
    );
  }

  if (!brief) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Title</span>
        <input
          className="mt-1 w-full rounded-lg border p-2"
          value={brief.title ?? ""}
          onChange={(e) => setBrief({ ...brief, title: e.target.value })}
          onBlur={() => save({ title: brief.title })}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Source URL</span>
        <input
          className="mt-1 w-full rounded-lg border p-2"
          value={brief.source_url ?? ""}
          onChange={(e) => setBrief({ ...brief, source_url: e.target.value })}
          onBlur={() => save({ source_url: brief.source_url })}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">HTML (optional)</span>
        <textarea
          className="mt-1 w-full rounded-lg border p-2 h-48"
          value={brief.html ?? ""}
          onChange={(e) => setBrief({ ...brief, html: e.target.value })}
          onBlur={() => save({ html: brief.html })}
          placeholder="Paste article HTML here…"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">Summary</span>
          <textarea
            className="mt-1 w-full rounded-lg border p-2 h-32"
            value={brief.summary ?? ""}
            onChange={(e) => setBrief({ ...brief, summary: e.target.value })}
            onBlur={() => save({ summary: brief.summary })}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            className="mt-1 w-full rounded-lg border p-2 h-32"
            value={brief.notes ?? ""}
            onChange={(e) => setBrief({ ...brief, notes: e.target.value })}
            onBlur={() => save({ notes: brief.notes })}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Status</span>
        <select
          className="mt-1 w-full rounded-lg border p-2"
          value={brief.status ?? "new"}
          onChange={(e) => {
            const val = e.target.value as Brief["status"];
            setBrief({ ...brief, status: val });
            void save({ status: val });
          }}
        >
          <option value="new">new</option>
          <option value="draft">draft</option>
          <option value="ready">ready</option>
          <option value="archived">archived</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Tags (comma-separated)</span>
        <input
          className="mt-1 w-full rounded-lg border p-2"
          value={(brief.tags ?? []).join(", ")}
          onChange={(e) =>
            setBrief({
              ...brief,
              tags: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          onBlur={() => save({ tags: brief.tags ?? [] })}
        />
      </label>

      <div className="text-sm">
        {saving ? <span>Saving…</span> : message ? <span className="text-green-600">{message}</span> : null}
      </div>
    </div>
  );
}
