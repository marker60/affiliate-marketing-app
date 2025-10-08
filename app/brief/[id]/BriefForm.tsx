// app/brief/[id]/BriefForm.tsx
// [LABEL: CLIENT COMPONENT]
"use client"

// [LABEL: TOP IMPORTS]
import * as React from "react"

// [LABEL: TYPES]
type BriefOut = {
  url: string
  title?: string
  description?: string
  bullets?: string[]
  text?: string
} | { ok: true; id: string } | null

/**
 * [LABEL: DEFAULT EXPORT]
 * - Product URL input (id="product-url")
 * - Generate Brief (POST /api/brief)
 * - Save (GET /api/brief/save?url=...)
 * - Test Fetch (GET /api/brief?url=...) shows JSON and a small preview
 */
export default function BriefForm() {
  // [LABEL: STATE]
  const [url, setUrl] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const [out, setOut] = React.useState<BriefOut>(null)

  // [LABEL: HELPERS]
  function setBusy(b: boolean) {
    setLoading(b)
    if (b) {
      setErr(null)
      setOut(null)
    }
  }

  // [LABEL: ACTION — POST /api/brief {url}]
  async function generateBrief() {
    const u = url.trim()
    if (!u) return setErr("Please enter a URL.")
    try {
      setBusy(true)
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: u }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || json?.error || "Failed")
      setOut(json)
    } catch (e: any) {
      setErr(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  // [LABEL: ACTION — GET /api/brief/save?url=...]
  async function saveBrief() {
    const u = url.trim()
    if (!u) return setErr("Please enter a URL.")
    try {
      setBusy(true)
      const res = await fetch(`/api/brief/save?url=${encodeURIComponent(u)}`, { method: "GET" })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.error || "Save failed")
      setOut(json) // shows { ok: true, id }
    } catch (e: any) {
      setErr(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  // [LABEL: ACTION — DEBUG GET /api/brief?url=...]
  async function testFetch() {
    const u = url.trim()
    if (!u) return setErr("Please enter a URL.")
    try {
      setBusy(true)
      const res = await fetch(`/api/brief?url=${encodeURIComponent(u)}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || json?.error || "Fetch failed")
      setOut(json)
    } catch (e: any) {
      setErr(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  // [LABEL: RENDER]
  return (
    <form
      className="mx-auto w-full max-w-3xl space-y-4"
      onSubmit={(e) => { e.preventDefault(); generateBrief() }}
    >
      {/* [LABEL: FIELD — PRODUCT URL] */}
      <div className="space-y-2">
        <label htmlFor="product-url" className="text-sm font-medium">
          Product URL
        </label>
        <input
          id="product-url"
          type="url"
          inputMode="url"
          placeholder="https://example.com/product"
          className="w-full rounded-md border bg-transparent px-3 py-2"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* [LABEL: ACTIONS] */}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Working…" : "Generate Brief"}
        </button>
        <button
          type="button"
          onClick={saveBrief}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={testFetch}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Testing…" : "Test Fetch"}
        </button>
      </div>

      {/* [LABEL: ERROR STATE] */}
      {err && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500">
          Error: {err}
        </div>
      )}

      {/* [LABEL: PREVIEW — STRUCTURED VIEW] */}
      {out && "url" in out && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="text-xs text-muted-foreground">{out.url}</div>
          <h3 className="text-lg font-medium">{out.title || "(no title)"}</h3>
          {out.description && <p className="text-sm">{out.description}</p>}
          {Array.isArray(out.bullets) && out.bullets.length > 0 && (
            <ul className="list-disc pl-5 text-sm">
              {out.bullets.slice(0, 8).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* [LABEL: OUTPUT — RAW JSON FALLBACK] */}
      {out && (
        <pre className="max-h-[28rem] overflow-auto rounded-md border p-3 text-xs">
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </form>
  )
}
