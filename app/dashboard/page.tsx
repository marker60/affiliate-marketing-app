import Link from "next/link";

type BriefRow = {
  id: string;
  created_at: string | null;
  title: string;
  source_url: string | null;
  url: string | null;
};

async function getBriefs(): Promise<BriefRow[]> {
  // Use the same logic as /brief
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/brief/list`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load (${res.status})`);
  const json = await res.json();
  return json.data ?? [];
}

export default async function DashboardPage() {
  let recent: BriefRow[] = [];
  let errorMsg: string | null = null;

  try {
    const rows = await getBriefs();
    recent = rows.slice(0, 5);
  } catch (err: any) {
    errorMsg = err?.message || "Failed to load";
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded border border-zinc-800 p-5">
          <h2 className="text-lg font-semibold">New Brief</h2>
          <p className="text-sm text-zinc-400 mt-1">Paste a product URL and generate a brief.</p>
          <Link href="/brief/new" className="inline-block mt-4 px-3 py-2 rounded bg-green-600 hover:bg-green-500">
            Create
          </Link>
        </div>

        <div className="rounded border border-zinc-800 p-5">
          <h2 className="text-lg font-semibold">Manage Briefs</h2>
          <p className="text-sm text-zinc-400 mt-1">Open, copy links, or delete saved briefs.</p>
          <Link href="/brief" className="inline-block mt-4 px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600">
            View Briefs
          </Link>
        </div>
      </div>

      <section className="mt-2">
        <h3 className="text-xl font-semibold mb-3">Recent Briefs</h3>

        {errorMsg && <div className="text-red-500">Error: {errorMsg}</div>}

        {!errorMsg && recent.length === 0 && (
          <div className="text-zinc-400">No briefs yet. Create one from <Link className="underline" href="/brief/new">/brief/new</Link>.</div>
        )}

        <div className="space-y-3">
          {recent.map((r) => {
            const source = r.source_url || r.url;
            return (
              <div key={r.id} className="rounded border border-zinc-800 p-4 flex flex-col gap-2">
                <div className="text-xs text-zinc-400">
                  {new Date(r.created_at ?? Date.now()).toLocaleString()} · {r.id.slice(0, 8)}…
                </div>

                <Link href={`/brief/${r.id}`} className="text-lg font-semibold hover:underline">{r.title}</Link>

                <div className="flex items-center gap-3">
                  {source ? (
                    <a className="text-blue-400 hover:underline" href={source} target="_blank" rel="noopener noreferrer">
                      Open original
                    </a>
                  ) : (
                    <span className="text-zinc-500">No source URL</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
