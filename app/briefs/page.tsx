import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

type Brief = {
  id: string
  created_at: string
  title: string
  source_url: string | null
  html_raw: string | null
  origin: string | null
}

async function getBriefs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
  const { data, error } = await supabase
    .from('briefs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25)
  if (error) throw error
  return data as Brief[]
}

export default async function BriefsPage() {
  const briefs = await getBriefs()

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Briefs</h1>
        <Link className="border rounded px-3 py-1" href="/briefs/new">
          New
        </Link>
      </div>

      <div className="space-y-4">
        {briefs.map((b) => (
          <div key={b.id} className="rounded border p-4">
            <div className="text-xs opacity-70 mb-1">
              {new Date(b.created_at).toLocaleString()}
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-medium">{b.title}</div>
                {b.source_url ? (
                  <div className="text-sm">
                    <a
                      className="underline"
                      href={b.source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open original
                    </a>
                  </div>
                ) : (
                  <div className="text-sm opacity-70">No source URL</div>
                )}
              </div>
              <Link
                href={`/brief/${b.id}`}
                className="border rounded px-3 py-1 whitespace-nowrap"
              >
                View brief
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
