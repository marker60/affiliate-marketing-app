import Link from "next/link";
import { getBaseUrl } from "@/lib/base-url";

type BriefRow = {
  id: string;
  created_at: string | null;
  title: string;
  source_url: string | null;
  url: string | null;
};

async function getRecentBriefs(): Promise<BriefRow[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/brief/list`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.data ?? [];
}

export default async function DashboardPage() {
  let rows: BriefRow[] = [];
  let error: string | null = null;

  try {
    rows = await getRecentBriefs();
  } catch (e: any) {
    error = e?.message || "Failed to load";
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded border border-zinc-800 p-6">
          <h2 className="text-xl font-semibold">New Brief</h2>
          <p className="text-zinc-400 mt-1">Paste a product URL and generate a brief.</p>
          <Link
            href="/brief/new"
            className="inline-block mt-4 px-4 py-2 rounded bg-green-600 hover:bg-green-500"
          >
            Create
          </Link>
        </div>

        <div className="rounded border border-zinc-800 p-6">
          <h2 className="text-xl font-semibold">Manage Briefs</h2>
          <p className="text-zinc-400 mt-1">Open, copy links, or delete saved briefs.</p>
          <Link
            href="/brief"
            className="inline-block mt-4 px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
          >
            View Briefs
          </Link>
        </div>
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-3">Recent Briefs</h3>
        {error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : rows.length === 0 ? (
          <div className="text-zinc-400">No briefs yet.</div>
        ) : (
          <ul className="space-y-2">
            {rows.slice(0, 5).map((r) => (
              <li key={r.id} className="rounded border border-zinc-800 p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400">
                    {new Date(r.created_at ?? Date.now()).toLocaleString()}
                  </div>
                  <Link href={`/brief/${r.id}`} className="font-medium hover:underline">
                    {r.title}
                  </Link>
                </div>
                <Link href={`/brief/${r.id}`} className="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
