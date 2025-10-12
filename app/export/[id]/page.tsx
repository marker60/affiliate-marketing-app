// app/export/[id]/page.tsx
// Make this page dynamic so Next won't try to prerender it during build
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function ExportPage({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Export</h1>
        <Link href="/" className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">
          Home
        </Link>
      </div>

      <div className="rounded border border-zinc-800 p-4 space-y-3">
        <div className="text-sm text-zinc-400">Export ID: {id}</div>
        <p className="text-zinc-200">
          This is a placeholder page. No data is fetched at build time, so deployments won’t fail.
        </p>
        <p className="text-zinc-400 text-sm">
          If you have an API that prepares downloads (e.g. <code>/api/export/{'{id}'}</code>), you can link to it here.
        </p>
      </div>
    </div>
  );
}
