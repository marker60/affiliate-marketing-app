// app/brief/[id]/BriefForm.tsx
// [LABEL: CLIENT COMPONENT]
"use client"

// [LABEL: TOP IMPORTS]
import * as React from "react"
// [LABEL: TOP IMPORTS — MARKDOWN]
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// [LABEL: TYPES]
type ScrapeResult = {
  url: string
  title?: string
  description?: string
  bullets?: string[]
  text?: string
}
type SaveResult = { ok: true; id: string }
type ApiError = { ok: false; error: string; details?: string }
type BriefOut = ScrapeResult | SaveResult | ApiError | null

// [LABEL: DEFAULT EXPORT]
export default function BriefForm() {
  // [LABEL: STATE]
  const [mode, setMode] = React.useState<"url" | "html">("url")
  const [url, setUrl] = React.useState("")
  const [html, setHtml] = React.useState("") // used in HTML mode
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

  // [LABEL: ACTION — GENERATE (URL or HTML)]
  const generateBrief = async () => {
    const u = url.trim()
    const h = html.trim()
    if (mode === "url" && !u) return setErr("Please enter a URL.")
    if (mode === "html" && !h) return setErr("Please paste page HTML.")

    try {
      setBusy(true)
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body:
          mode === "html"
            ? JSON.stringify({ url: u || "about:blank", html: h })
            : JSON.stringify({ url: u }),
      })
      const json = (await res.json()) as ScrapeResult | ApiError
      if (!res.ok || ("ok" in json && json.ok === false)) {
        const e = json as ApiError
        setOut(e)
        throw new Error(e.error)
      }
      setOut(json as ScrapeResult)
    } catch (e: any) {
      setErr(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  // [LABEL: ACTION — SAVE (URL MODE ONLY)]
  const saveBrief = async () => {
    const u = url.trim()
    if (!u) return setErr("Please enter a URL.")
    try {
      setBusy(true)
      const res = await fetch(`/api/brief/save?url=${encodeURIComponent(u)}`)
      const json = (await res.json()) as SaveResult | ApiError
      if (!res.ok || ("ok" in json && (json as any).ok === false)) {
        const e = json as ApiError
        setOut(e)
        throw new Error(e.error)
      }
      setOut(json as SaveResult)
    } catch (e: any) {
      setErr(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  // [LABEL: ACTION — TEST FETCH (URL MODE ONLY)]
  const testFetch = async () => {
    const u = url.trim()
    if (!u) return setErr("Please enter a URL.")
    try {
      setBusy(true)
      const res = await fetch(`/api/brief?url=${encodeURIComponent(u)}`, { cache: "no-store" })
      const json = (await res.json()) as ScrapeResult | ApiError
      if (!res.ok || ("ok" in json && json.ok === false)) {
        const e = json as ApiError
        setOut(e)
        throw new Error(e.error)
      }
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
        void generateBrief()
      }}
    >
      {/* [LABEL: MODE TABS] */}
      <div className="inline-flex rounded-md border p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded px-3 py-1 ${mode === "url" ? "bg-gray-100 dark:bg-zinc-800" : ""}`}
        >
          From URL
        </button>
        <button
          type="button"
          onClick={() => setMode("html")}
          className={`rounded px-3 py-1 ${mode === "html" ? "bg-gray-100 dark:bg-zinc-800" : ""}`}
        >
          From HTML
        </button>
      </div>

      {/* [LABEL: FIELD — URL INPUT (VISIBLE IN URL MODE)] */}
      {mode === "url" && (
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
      )}

      {/* [LABEL: FIELD — HTML TEXTAREA (VISIBLE IN HTML MODE)] */}
      {mode === "html" && (
        <div className="space-y-2">
          <label htmlFor="product-html" className="text-sm font-medium">
            Page HTML
          </label>
          <textarea
            id="product-html"
            rows={10}
            placeholder="Paste the page HTML here (View Source or Copy OuterHTML of &lt;html&gt;)"
            className="w-full rounded-md border bg-transparent px-3 py-2 font-mono text-xs"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Tip: In your browser, open the product page → right-click → “View page source” → copy all, paste here.
          </p>
        </div>
      )}

      {/* [LABEL: ACTIONS] */}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Working…" : "Generate Brief"}
        </button>

        {/* Hide Save/Test when using HTML mode (no canonical URL) */}
        {mode === "url" && (
          <>
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
          </>
        )}
      </div>

      {/* [LABEL: ERROR STATE] */}
      {err && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500">
          Error: {err}
        </div>
      )}

      {/* [LABEL: BLOCKED SITE STATE] */}
      {out && "ok" in (out as any) && (out as ApiError).ok === false && (out as ApiError).error === "blocked_by_anti_bot" && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-500">
          This site is blocking scraping. Switch to <b>From HTML</b> and paste the page HTML, or try a different URL.
        </div>
      )}

      {/* [LABEL: SUCCESS — SAVED LINK] */}
      {out && "ok" in (out as any) && (out as any).ok === true && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
          Saved!{" "}
          <a href="/briefs" className="underline">
            View in Briefs
          </a>
        </div>
      )}

      {/* [LABEL: PREVIEW — CARD] */}
      {out && "url" in (out as ScrapeResult) && (() => {
        const o = out as ScrapeResult
        let pretty = o.url
        try {
          const u = new URL(o.url)
          pretty = u.origin + u.pathname
        } catch {}
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

            {/* [LABEL: FULL TEXT — MARKDOWN RENDER] */}
            {o.text && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm underline">Full text (Markdown)</summary>
                <div className="mt-2 max-h-[24rem] overflow-auto rounded-md border p-3 text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...p }) => <h1 className="mt-3 text-xl font-semibold" {...p} />,
                      h2: ({ node, ...p }) => <h2 className="mt-3 text-lg font-semibold" {...p} />,
                      h3: ({ node, ...p }) => <h3 className="mt-3 font-semibold" {...p} />,
                      p: ({ node, ...p }) => <p className="mt-2 leading-relaxed" {...p} />,
                      ul: ({ node, ...p }) => <ul className="mt-2 list-disc pl-5 space-y-1" {...p} />,
                      ol: ({ node, ...p }) => <ol className="mt-2 list-decimal pl-5 space-y-1" {...p} />,
                      a: ({ node, ...p }) => (
                        <a className="underline" target="_blank" rel="noreferrer" {...p} />
                      ),
                      code: ({ node, children, ...p }) => {
                        const text = String(children ?? "")
                        const isBlock = text.includes("\n")
                        return isBlock ? (
                          <code className="block overflow-auto rounded bg-muted p-2 text-xs" {...p}>
                            {text}
                          </code>
                        ) : (
                          <code className="rounded bg-muted px-1 py-0.5" {...p}>
                            {text}
                          </code>
                        )
                      },
                    }}
                  >
                    {o.text}
                  </ReactMarkdown>
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
