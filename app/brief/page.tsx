import Link from "next/link";

type BriefRow = {
  id: string;
  created_at: string | null;
  title: string;
  source_url: string | null;
  // url is optional; API may not return it yet
  url?: string | null;
};

export const dynamic = "force-dynamic";

async function getBriefs(): Promise<{ rows: BriefRow[]; error?: string }> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const res = await fetch(`${base}/api/brief/list`, { cache: "no-store" });

    // If API failed, try to read the error body and surface it, but don’t crash
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        if (j?.error) msg = j.error;
      } catch {}
      return { rows: [], error: msg };
    }

    const json = await res.json();
    return { rows: (json?.data as BriefRow[]) ?? [] };
  } catch (e: any) {
    return { rows: [], error: e?.message ?? "Failed to load" };
  }
}

export default async function BriefsPage() {
  const { rows, error } = await getBriefs();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Briefs</h1>
        <Link className="px-3 py-2 rounded bg-green-600 hover:bg-green-500" href="/brief/new">
          New Brief
        </Link>
      </div>

      {error && (
        <div className="text-red-400">
          Error: {error}
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => {
          const source = r.source_url || r.url || undefined;
          return (
            <div key={r.id} className="rounded border border-zinc-800 p-4 flex flex-col gap-2">
              <div className="text-xs text-zinc-400">
                {new Date(r.created_at ?? Date.now()).toLocaleString()} · {r.id.slice(0, 8)}…
              </div>

              <Link href={`/brief/${r.id}`} className="text-lg font-semibold hover:underline">
                {r.title}
              </Link>

              <div className="flex items-center gap-3">
                {source ? (
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Open original
                  </a>
                ) : (
                  <span className="text-zinc-500">No source URL</span>
                )}
                {/* Delete action can be wired later */}
              </div>
            </div>
          );
        })}

        {rows.length === 0 && !error && (
          <div className="text-zinc-400">
            No briefs yet. Create one from <Link className="underline" href="/brief/new">/brief/new</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
