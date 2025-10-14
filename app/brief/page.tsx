// [LABEL: FILE] app/brief/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BriefListItem = {
  id: string;
  title: string;
  status: "new" | "draft" | "ready" | "archived";
  updated_at: string;
  created_at: string;
  source_url?: string | null;
  tags?: string[] | null;
};

export default function BriefListPage() {
  const [items, setItems] = React.useState<BriefListItem[]>([]);
  const [filtered, setFiltered] = React.useState<BriefListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/brief/list", { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Failed to load");
        setItems(json.items as BriefListItem[]);
        setFiltered(json.items as BriefListItem[]);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    const term = q.toLowerCase().trim();
    if (!term) {
      setFiltered(items);
      return;
    }
    setFiltered(
      items.filter((it) => {
        const hay = [
          it.title,
          it.status,
          it.source_url ?? "",
          ...(it.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      })
    );
  }, [q, items]);

  async function createBrief() {
    try {
      setCreating(true);
      const title = `Untitled ${new Date().toLocaleString()}`;
      const res = await fetch("/api/brief/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Create failed");
      router.push(`/brief/${json.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Create failed");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Briefs</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search title, tags, status…"
            className="w-64 rounded-lg border px-3 py-2 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={createBrief}
            disabled={creating}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            {creating ? "Creating…" : "New Brief"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">
                  No briefs yet.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      href={`/brief/${b.id}`}
                      className="underline underline-offset-2"
                    >
                      {b.title || "(untitled)"}
                    </Link>
                    {b.source_url ? (
                      <a
                        href={b.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-xs text-gray-500 hover:underline"
                      >
                        source ↗
                      </a>
                    ) : null}
                  </td>
                  <td className="p-3">{b.status}</td>
                  <td className="p-3">
                    {new Date(b.updated_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {(b.tags ?? []).join(", ")}
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
