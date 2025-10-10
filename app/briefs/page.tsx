// app/briefs/page.tsx
// [LABEL: CLIENT PAGE — BRIEFS LIST WITH ACTIONS]
"use client"

// [LABEL: TOP IMPORTS]
import * as React from "react"

// [LABEL: TYPES]
type BriefRow = {
  id: string
  url: string
  title?: string | null
  description?: string | null
  bullets?: string[] | null
  text?: string | null
  created_at: string
}

// [LABEL: FETCH — LIST FUNCTION]
async function fetchBriefs(limit = 20): Promise<BriefRow[]> {
  const res = await fetch(`/api/brief/list?limit=${limit}`, { cache: "no-store" })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || "Failed to load")
  return json.rows || []
}

// [LABEL: DEFAULT EXPORT — PAGE COMPONENT]
export default function BriefsPage() {
  // [LABEL: STATE]
  const [rows, setRows] = React.useState<BriefRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null) // track which row is busy

  // [LABEL: EFFECT — INITIAL LOAD]
  React.useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        const data = await fetchBriefs(20)
        setRows(data)
      } catch (e: any) {
        setErr(String(e?.message || e))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // [LABEL: HANDLER — REFRESH LIST]
  const onRefresh = React.useCallback(async () => {
    try {
      setLoading(true)
      setErr(null)
      const data = await fetchBriefs(20)
      setRows(data)
    } catch (e: any) {
      setErr(String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }, [])

  // [LABEL: HANDLER — DELETE ONE]
  const onDelete = React.useCallback(async (id: string) => {
    if (!confirm("Delete this brief?")) return
    try {
      setBusyId(id)
      const res = await fetch(`/api/brief/delete?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || "Delete failed")
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch (e: any) {
      alert(`Error: ${e?.message || e}`)
    } finally {
      setBusyId(null)
    }
  }, [])

  // [LABEL: HANDLER — COPY LINK]
  const onCopy = React.useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      // simple visual confirm
      alert("Link copied to clipboard.")
    } catch {
      alert("Unable to copy link.")
    }
  }, [])

  // [LABEL: RENDER]
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8 space-y-6">
      {/* [LABEL: HEADER + REFRESH] */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Briefs</h1>
        <button
          onClick={() => void onRefresh()}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          Refresh
        </button>
      </div>

      {/* [LABEL: STATUS] */}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {err && <p className="text-sm text-red-500">Error: {err}</p>}
      {!loading && !err && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No briefs yet.</p>
      )}

      {/* [LABEL: LIST] */}
      {rows.length > 0 && (
        <ul className="space-y-4">
          {rows.map((r) => {
            // [LABEL: PRETTY URL — STRIP QUERY, SHOW CLEAN]
            let pretty = r.url
            try {
              const u = new URL(r.url)
              pretty = u.origin + u.pathname
            } catch {/* ignore */}

            return (
              // [LABEL: CARD]
              <li key={r.id} className="rounded-lg border p-4 overflow-hidden">
                {/* [LABEL: CARD HEADER — META + ACTIONS] */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* [LABEL: LEFT — TIME, TITLE, URL] */}
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </div>

                    <h2 className="text-lg font-medium break-words">
                      {r.title || "(no title)"}
                    </h2>

                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-muted-foreground hover:underline truncate max-w-[65ch] sm:max-w-[80ch]"
                      title={r.url}
                    >
                      {pretty}
                    </a>
                  </div>

                  {/* [LABEL: RIGHT — ID + ACTION BUTTONS] */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground select-all">{r.id}</span>

                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800"
                      title="Open link"
                    >
                      Open
                    </a>

                    <button
                      onClick={() => void onCopy(r.url)}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800"
                      title="Copy link"
                    >
                      Copy Link
                    </button>

                    <button
                      onClick={() => void onDelete(r.id)}
                      disabled={busyId === r.id}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      title="Delete"
                    >
                      {busyId === r.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>

                {/* [LABEL: OPTIONAL CONTENT — DESCRIPTION] */}
                {r.description && (
                  <p className="mt-2 text-sm break-words">{r.description}</p>
                )}

                {/* [LABEL: OPTIONAL CONTENT — BULLETS] */}
                {Array.isArray(r.bullets) && r.bullets.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    {r.bullets
                      .map((b: string) => String(b).trim())
                      .filter(Boolean)
                      .slice(0, 10)
                      .map((b: string, i: number) => (
                        <li key={i} className="break-words">
                          {b}
                        </li>
                      ))}
                  </ul>
                )}

                {/* [LABEL: OPTIONAL CONTENT — FULL TEXT COLLAPSIBLE] */}
                {r.text && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm underline">Show text</summary>
                    <div className="mt-2 max-h-60 overflow-auto rounded-md border p-3 text-xs whitespace-pre-wrap break-words">
                      {r.text}
                    </div>
                  </details>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
