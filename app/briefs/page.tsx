// [LABEL: CLIENT PAGE — BRIEFS LIST]
"use client"

// [LABEL: TOP IMPORTS]
import * as React from "react"

// [LABEL: DEFAULT EXPORT — CLIENT COMPONENT]
export default function BriefsPage() {
  // [LABEL: STATE]
  const [rows, setRows] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)

  // [LABEL: EFFECT — FETCH FROM API]
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch("/api/brief/list?limit=20", { cache: "no-store" })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error || "Failed")
        if (alive) setRows(json.rows || [])
      } catch (e: any) {
        if (alive) setErr(String(e.message || e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // [LABEL: RENDER]
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8 space-y-6">
      {/* [LABEL: HEADER + REFRESH] */}
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-semibold">Briefs</h1>
  <button
    onClick={() => {
      // simple re-fetch
      setRows([]); setErr(null); setLoading(true);
      fetch("/api/brief/list?limit=20", { cache: "no-store" })
        .then(r => r.json())
        .then(j => {
          if (!j.ok) throw new Error(j.error || "Failed");
          setRows(j.rows || [])
        })
        .catch(e => setErr(String(e.message || e)))
        .finally(() => setLoading(false))
    }}
    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
  >
    Refresh
  </button>
</div>


      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {err && <p className="text-sm text-red-500">Error: {err}</p>}

      {!loading && !err && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No briefs yet.</p>
      )}

      {rows.length > 0 && (
        <ul className="space-y-4">
          {rows.map((r) => (
            // [LABEL: CARD WRAP FIX]
<li key={r.id} className="rounded-lg border p-4 overflow-hidden">

             // [LABEL: HEADER LAYOUT — WRAP + PIN ACTIONS]
<div className="flex items-start justify-between gap-4 flex-wrap">
  {/* [LABEL: LEFT — TIME, TITLE, URL] */}
  <div className="min-w-0">
    <div className="text-sm text-muted-foreground">
      {new Date(r.created_at).toLocaleString()}
    </div>
    <h2 className="text-lg font-medium break-words">
      {r.title || "(no title)"}
    </h2>

    {/* [LABEL: PRETTY URL — NO QUERY + TRUNCATE] */}
    {(() => {
      let pretty = r.url
      try {
        const u = new URL(r.url)
        pretty = u.origin + u.pathname // strip ?query
      } catch {}
      return (
        <a
          href={r.url}
          target="_blank"
          rel="noreferrer"
          className="block text-sm text-muted-foreground hover:underline truncate max-w-[65ch] sm:max-w-[80ch]"
          title={r.url}
        >
          {pretty}
        </a>
      )
    })()}
  </div>

  {/* [LABEL: RIGHT — ID + DELETE (PINNED)] */}
  <div className="flex items-center gap-2 shrink-0">
    <span className="text-xs text-muted-foreground select-all">{r.id}</span>
    <button
      onClick={async () => {
        if (!confirm("Delete this brief?")) return
        try {
          const res = await fetch(`/api/brief/delete?id=${encodeURIComponent(r.id)}`, {
            method: "DELETE",
          })
          const json = await res.json()
          if (!json.ok) throw new Error(json.error || "Delete failed")
          setRows((prev) => prev.filter((x) => x.id !== r.id))
        } catch (e: any) {
          alert(`Error: ${e.message || e}`)
        }
      }}
      className="rounded-md border px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20"
      title="Delete"
    >
      Delete
    </button>
  </div>
</div>

                {/* [LABEL: RIGHT-SIDE ACTIONS] */}
<div className="flex items-center gap-2">
  <span className="text-xs text-muted-foreground select-all">{r.id}</span>
  <button
    onClick={async () => {
      if (!confirm("Delete this brief?")) return
      try {
        const res = await fetch(`/api/brief/delete?id=${encodeURIComponent(r.id)}`, {
          method: "DELETE",
        })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error || "Delete failed")
        // [LABEL: OPTIMISTIC REMOVE]
        setRows((prev) => prev.filter((x) => x.id !== r.id))
      } catch (e: any) {
        alert(`Error: ${e.message || e}`)
      }
    }}
    className="rounded-md border px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20"
    title="Delete"
  >
    Delete
  </button>
</div>

              </div>

              {r.description && <p className="mt-2 text-sm">{r.description}</p>}

              {Array.isArray(r.bullets) && r.bullets.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {r.bullets.slice(0, 5).map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}

              {r.text && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm underline">
                    Show text
                  </summary>
                  <pre className="mt-2 max-h-60 overflow-auto rounded-md border p-3 text-xs whitespace-pre-wrap">
                    {r.text}
                  </pre>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
