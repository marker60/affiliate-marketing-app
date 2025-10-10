// app/dashboard/page.tsx
// [LABEL: CLIENT PAGE — DASHBOARD]
"use client"

// [LABEL: TOP IMPORTS]
import * as React from "react"

// [LABEL: TYPES]
type BriefRow = {
  id: string
  url: string
  title?: string | null
  created_at: string
}

// [LABEL: FETCH — LAST N BRIEFS]
async function fetchRecent(limit = 5): Promise<BriefRow[]> {
  const res = await fetch(`/api/brief/list?limit=${limit}`, { cache: "no-store" })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || "Failed to load")
  return json.rows || []
}

// [LABEL: DEFAULT EXPORT — DASHBOARD PAGE]
export default function DashboardPage() {
  // [LABEL: STATE]
  const [rows, setRows] = React.useState<BriefRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)

  // [LABEL: EFFECT — INITIAL LOAD]
  React.useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        const data = await fetchRecent(5)
        setRows(data)
      } catch (e: any) {
        setErr(String(e?.message || e))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // [LABEL: RENDER]
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
      {/* [LABEL: HEADER] */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <a
            href="/briefs"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            View Briefs
          </a>
          <a
            href="/dev"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Dev
          </a>
        </div>
      </div>

      {/* [LABEL: QUICK ACTIONS] */}
      <section className="grid gap-3 sm:grid-cols-2">
        <a
          href="/brief/quick"
          className="rounded-xl border p-5 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition"
        >
          <h2 className="text-lg font-medium">New Brief</h2>
          <p className="text-sm text-muted-foreground">
            Paste a product URL and generate a brief.
          </p>
        </a>

        <a
          href="/briefs"
          className="rounded-xl border p-5 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition"
        >
          <h2 className="text-lg font-medium">Manage Briefs</h2>
          <p className="text-sm text-muted-foreground">Open, copy links, or delete saved briefs.</p>
        </a>
      </section>

      {/* [LABEL: RECENT BRIEFS] */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Recent Briefs</h2>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {err && <p className="text-sm text-red-500">Error: {err}</p>}
        {!loading && !err && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No briefs yet.</p>
        )}

        {rows.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {rows.map((r) => {
              // [LABEL: PRETTY URL — STRIP QUERY]
              let pretty = r.url
              try {
                const u = new URL(r.url)
                pretty = u.origin + u.pathname
              } catch {/* ignore */}

              return (
                <li key={r.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                    <div className="font-medium break-words">{r.title || "(no title)"}</div>
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

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      Open
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(r.url)
                          alert("Link copied to clipboard.")
                        } catch {
                          alert("Unable to copy link.")
                        }
                      }}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      Copy
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
