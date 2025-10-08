"use client"

import * as React from "react"

// [LABEL: TOP IMPORTS — ADD THIS LINE]
import { Carousel, CarouselItem } from "@/components/ui/carousel"


/* --- Brief Tester (GET /api/brief and GET /api/brief/save) --- */
function BriefTester() {
  const [url, setUrl] = React.useState("https://example.com")
  const [out, setOut] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  async function run() {
    setLoading(true); setErr(null); setOut(null)
    try {
      const res = await fetch(`/api/brief?url=${encodeURIComponent(url)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || json?.error || "Failed")
      setOut(json)
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    setLoading(true); setErr(null); setOut(null)
    try {
      const res = await fetch(`/api/brief/save?url=${encodeURIComponent(url)}`)
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.error || "Save failed")
      setOut(json)
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-2">
      <h2 className="font-medium">Brief Tester</h2>
      <div className="flex gap-2">
        <input
          className="w-full rounded-md border bg-transparent px-3 py-2"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={run}
          disabled={loading}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Fetch"}
        </button>
        <button
          onClick={save}
          disabled={loading}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
      {err && <div className="text-red-500 text-sm">Error: {err}</div>}
      {out && (
        <pre className="max-h-80 overflow-auto rounded-md border p-3 text-xs">
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </section>
  )
}

/* --- Saved Briefs viewer (GET /api/brief/list) --- */
function SavedBriefs() {
  const [rows, setRows] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const res = await fetch("/api/brief/list?limit=5")
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || "Failed")
      setRows(json.rows || [])
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-2">
      <h2 className="font-medium">Saved Briefs</h2>
      <button
        onClick={load}
        disabled={loading}
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Loading…" : "Load Last 5"}
      </button>
      {err && <div className="text-red-500 text-sm">Error: {err}</div>}
      {rows.length > 0 && (
        <ul className="list-disc pl-5 text-sm">
          {rows.map((r) => (
            <li key={r.id}>
              <span className="font-medium">{r.title || "(no title)"}</span>{" "}
              — <a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.url}</a>
            </li>
          ))}
        </ul>
      )}
      {rows.length === 0 && !loading && !err && (
        <div className="text-sm text-muted-foreground">No rows yet.</div>
      )}
    </section>
  )
}

/* --- DEFAULT EXPORT (required) --- */
export default function DevPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <h1 className="text-2xl font-semibold">UI Sanity — Dev</h1>

{/* [LABEL: JSX INSERT — CAROUSEL START] */}
<section className="space-y-2">
  <h2 className="font-medium">Carousel</h2>
  <Carousel className="w-full max-w-none">
    {[1, 2, 3].map((n) => (
      <CarouselItem key={n} className="basis-full">
        <div className="rounded-lg border p-10 text-center">Slide {n}</div>
      </CarouselItem>
    ))}
  </Carousel>
</section>
{/* [LABEL: JSX INSERT — CAROUSEL END] */}

      <BriefTester />
      <SavedBriefs />
    </main>
  )
}
