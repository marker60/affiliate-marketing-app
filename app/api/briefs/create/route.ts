import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string // needs insert perms or a policy that allows it
)

function tryExtractUrlFromHtml(html: string): string | null {
  const m1 = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
  if (m1?.[1]) return m1[1]
  const m2 = html.match(/<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']+)["']/i)
  if (m2?.[1]) return m2[1]
  const m3 = html.match(/<base[^>]*href=["']([^"']+)["']/i)
  if (m3?.[1]) return m3[1]
  return null
}

function validateUrl(u: string): string {
  const url = new URL(u)
  return url.toString()
}

export async function POST(req: Request) {
  try {
    const { title, html_raw, source_url } = (await req.json()) as {
      title?: string
      html_raw?: string
      source_url?: string
    }

    if (!title || !html_raw) {
      return NextResponse.json({ error: 'Missing title or html_raw' }, { status: 400 })
    }

    let finalUrl: string | null = null
    if (source_url) {
      try { finalUrl = validateUrl(source_url) } catch {}
    }
    if (!finalUrl) {
      const extracted = tryExtractUrlFromHtml(html_raw)
      if (extracted) {
        try { finalUrl = validateUrl(extracted) } catch {}
      }
    }

    const { data, error } = await supabase
      .from('briefs')
      .insert({
        title,
        html_raw,
        source_url: finalUrl,
        origin: 'manual'
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ brief: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}
