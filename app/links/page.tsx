// [LABEL: FILE] app/links/page.tsx
"use client";

import * as React from "react";

type LinkItem = {
  id: string;
  slug: string;
  title: string | null;
  destination_url: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  click_count: number;
};

function useToast(timeoutMs = 1600) {
  const [msg, setMsg] = React.useState<string | null>(null);
  const hideRef = React.useRef<number | null>(null);

  const show = React.useCallback((text: string) => {
    setMsg(text);
    if (hideRef.current) window.clearTimeout(hideRef.current);
    hideRef.current = window.setTimeout(() => setMsg(null), timeoutMs);
  }, [timeoutMs]);

  React.useEffect(() => () => { if (hideRef.current) window.clearTimeout(hideRef.current); }, []);
  return { msg, show };
}

export default function LinksPage() {
  const [items, setItems] = React.useState<LinkItem[]>([]);
  const [q, setQ] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const { msg: toastMsg, show: toast } = useToast();

  const origin =
    typeof window === "undefined"
      ? ""
      : `${window.location.protocol}//${window.location.host}`;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/links/list", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setItems(json.items);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  const filtered = React.useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return items;
    return items.filter((it) =>
      [it.title ?? "", it.slug, it.destination_url, ...(it.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [q, items]);

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError(null); setMessage(null);
    try {
      const res = await fetch("/api/links/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ destination_url: url, title }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Create failed");
      setMessage(`Created! ${json.short_url}`);
      setUrl(""); setTitle("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Create failed");
    } finally {
      setCreating(false);
      window.setTimeout(() => setMessage(null), 1800);
    }
  }

  async function copyShort(slug: string) {
    try {
      const shortUrl = origin ? `${origin}/l/${slug}` : `/l/${slug}`;
      await navigator.clipboard.writeText(shortUrl);
      toast("Copied!");
    } catch {
      toast("Copy failed");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 rounded-lg border bg-white px-3 py-2 text-sm shadow-md dark:bg-gray-900"
        >
          {toastMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-semibold">Links</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search title, slug, destination, tags…"
            className="w-56 md:w-80 rounded-lg border px-3 py-2 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-60"
            aria-busy={loading}
            aria-label="Refresh list"
            title="Refresh list"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <form onSubmit={createLink} className="rounded-lg border p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium">Destination URL</span>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Title (optional)</span>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="My promo link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          {creating ? "Creating…" : "Create Link"}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}
      </form>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950/50">
            <tr className="text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Clicks</th>
              <th className="p-3">Destination</th>
              <th className="p-3">Created</th>
              <th className="p-3 sr-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-gray-500">
                  {loading ? "Loading…" : "No links yet. Create your first link above."}
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-950/50">
                  <td className="p-3">{l.title || "(untitled)"}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-900">/l/{l.slug}</code>
                      {/* Click badge */}
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                        {l.click_count} clicks
                      </span>
                    </div>
                  </td>

                  <td className="p-3">{l.click_count}</td>

                  <td className="p-3 truncate max-w-[280px]">{l.destination_url}</td>

                  <td className="p-3">{new Date(l.created_at).toLocaleString()}</td>

                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => copyShort(l.slug)}
                      className="rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                      aria-label={`Copy short URL for ${l.slug}`}
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
