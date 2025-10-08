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
      <h1 className="text-2xl font-semibold">Briefs</h1>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {err && <p className="text-sm text-red-500">Error: {err}</p>}

      {!loading && !err && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No briefs yet.</p>
      )}

      {rows.length > 0 && (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                  <h2 className="text-lg font-medium">{r.title || "(no title)"}</h2>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                  >
                    {r.url}
                  </a>
                </div>
                <span className="text-xs text-muted-foreground select-all">
                  {r.id}
                </span>
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
