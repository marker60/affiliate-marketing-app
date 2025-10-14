// [LABEL: FILE] app/brief/[id]/page.tsx
import Link from "next/link";
import BriefForm from "./BriefForm";

export default function BriefPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Edit Brief</h1>
        <Link
          href="/brief"
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          ← All Briefs
        </Link>
      </div>

      {/* Client component handles fetching + save UX */}
      <BriefForm id={id} />
    </div>
  );
}
