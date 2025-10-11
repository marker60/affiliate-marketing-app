import Link from "next/link";

type BriefRow = {
  id: string;
  created_at: string | null;
  title: string;
  source_url: string | null;
  url: string | null;
};

async function getBriefs(): Promise<BriefRow[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/brief/list`, { cache: "no-store" });
  const json = await res.json();
  return json.data ?? [];
}

async function deleteBrief(id: string) {
  "use server";
  await fetch("/api/brief/delete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
    cache: "no-store",
  });
}

export default async function BriefsPage() {
  const rows = await getBriefs();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Briefs</h1>
        <Link className="px-3 py-2 rounded bg-green-600 hover:bg-green-500" href="/brief/new">
          New Brief
        </Link>
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const source = r.source_url || r.url;
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

                <form action={async () => deleteBrief(r.id)}>
                  <button type="submit" className="px-3 py-1 rounded bg-red-700/80 hover:bg-red-600">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="text-zinc-400">
            No briefs yet. Create one from <Link className="underline" href="/brief/new">/brief/new</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
