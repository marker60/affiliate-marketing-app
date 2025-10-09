// app/brief/[id]/BriefForm.tsx
// [LABEL: CLIENT COMPONENT]
"use client"

// [LABEL: TOP IMPORTS]
import * as React from "react"

// [LABEL: TYPES]
type ScrapeResult = {
  url: string
  title?: string
  description?: string
  bullets?: string[]
  text?: string
}
type SaveResult = { ok: true; id: string }
type BriefOut = ScrapeResult | SaveResult | null

// [LABEL: DEFAULT EXPORT]
export default function BriefForm() {
  // [LABEL: STATE]
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const [out, setOut] = React.useState<BriefOut>(null)

  // [LABEL: HELPERS]
  const setBusy = (b: boolean) => {
    setLoading(b)
    if (b) {
      setErr(null)
      setOut(null)
    }
  }

  // [LABEL: ACTION — POST /api/brief {url}]
  const generateBrief = async () => {
    const u = url.trim()
    if (!u) {
      setErr("Please enter a URL.")
      return
    }
    try {
      setBusy(true)
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: u }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || json?.error || "Failed")
      setOut(json as ScrapeResult)
    } catch (e: any) {
      setErr(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  // [LABEL: ACTION — GET /api/brief/save?url=...]
  const saveBrief = async () => {
    const u = url.trim()
    if (!u) {
      setErr("Please enter a URL.")
      return
    }
    try {
      setBusy(true)
      const res = await fetch(`/api/brief/save?url=${encodeURIComponent(u)}`)
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.error || "Save failed")
      setOut(json as SaveResult) // { ok: true, id }
    } catch (e: any) {
      setErr(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  // [LABEL: ACTION — DEBUG GET /api/brief?url=...]
  const testFetch = async () => {
    const u = url.trim()
    if (!u) {
      setErr("Please enter a URL.")
      return
    }
    try {
      setBusy(true)
      const res = await fetch(`/api/brief?url=${encodeURIComponent(u)}`, {
        cache: "no-store",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || json?.error || "Fetch failed")
      setOut(json as ScrapeResult)
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
      onSubmit={(e) => {
        e.preventDefault()
        // Explicitly ignore the Promise to keep TS happy
        void generateBrief()
      }}
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
          onClick={() => void saveBrief()}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving…" : "Save"}
        </button>

        <button
          type="button"
          onClick={() => void testFetch()}
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

      {/* [LABEL: PREVIEW — CARD V2] */}
      {out && "url" in (out as ScrapeResult) && (() => {
        const o = out as ScrapeResult
        let pretty = o.url
        try {
          const u = new URL(o.url)
          pretty = u.origin + u.pathname
        } catch {
          /* ignore */
        }
        return (
          <article className="rounded-xl border p-5 space-y-4">
            <header className="space-y-1">
              <a
                href={o.url}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-muted-foreground hover:underline truncate"
                title={o.url}
              >
                {pretty}
              </a>
              <h3 className="text-2xl font-semibold leading-snug break-words">
                {o.title || "(no title)"}
              </h3>
            </header>

            {o.description && (
              <p className="text-base leading-relaxed break-words">{o.description}</p>
            )}

            {Array.isArray(o.bullets) && o.bullets.length > 0 && (
              <ul className="list-disc pl-6 text-sm space-y-1">
                {o.bullets
                  .map((b) => String(b).trim())
                  .filter(Boolean)
                  .slice(0, 10)
                  .map((b, i) => (
                    <li key={i} className="break-words">
                      {b}
                    </li>
                  ))}
              </ul>
            )}

            {o.text && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm underline">Full text</summary>
                <div className="mt-2 max-h-[24rem] overflow-auto rounded-md border p-3 text-sm whitespace-pre-wrap break-words">
                  {o.text}
                </div>
              </details>
            )}
          </article>
        )
      })()}

      {/* [LABEL: OUTPUT — DEBUG JSON (COLLAPSIBLE)] */}
      {out && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm underline">Debug JSON</summary>
          <pre className="mt-2 max-h-[24rem] overflow-auto rounded-md border p-3 text-xs whitespace-pre-wrap break-words">
            {JSON.stringify(out, null, 2)}
          </pre>
        </details>
      )}
    </form>
  )
}
