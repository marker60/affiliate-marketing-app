'use client'

import { useState } from 'react'

export default function NewBriefPage() {
  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [htmlRaw, setHtmlRaw] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/briefs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          html_raw: htmlRaw,
          source_url: sourceUrl || undefined
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to create brief')
      setMsg('Brief saved!')
      setTitle('')
      setSourceUrl('')
      setHtmlRaw('')
    } catch (err: any) {
      setMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Brief (Paste HTML)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title *</label>
          <input
            className="w-full rounded border px-3 py-2 bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Original URL (optional)</label>
          <input
            className="w-full rounded border px-3 py-2 bg-transparent"
            placeholder="https://example.com/page"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
          <p className="text-xs opacity-70 mt-1">
            If left blank, we’ll try to extract a canonical URL from your HTML.
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">HTML *</label>
          <textarea
            className="w-full h-64 rounded border px-3 py-2 font-mono bg-transparent"
            value={htmlRaw}
            onChange={(e) => setHtmlRaw(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded px-4 py-2 border"
        >
          {submitting ? 'Saving...' : 'Save Brief'}
        </button>

        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </form>
    </div>
  )
}
