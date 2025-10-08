/* --- Brief Tester (calls /api/brief and /api/brief/save) --- */
function BriefTester() {
  const [url, setUrl] = React.useState("https://example.com")
  const [out, setOut] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  async function run() {
    setLoading(true)
    setErr(null)
    setOut(null)
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
    setLoading(true)
    setErr(null)
    setOut(null)
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
