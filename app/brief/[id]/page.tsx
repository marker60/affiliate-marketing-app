// app/brief/[id]/page.tsx

// [LABEL: TOP IMPORTS]
import * as React from "react"
import BriefForm from "./BriefForm"

// [LABEL: PAGE SETTINGS]
export const dynamic = "force-dynamic"

// [LABEL: DEFAULT EXPORT — PAGE]
export default async function BriefPage({
  params,
}: {
  params: { id: string }
}) {
  // If you need the id later, it's here:
  // const projectId = params.id

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Brief</h1>

      {/* [LABEL: BRIEF FORM — NO PROPS] */}
      <BriefForm />

      {/* [LABEL: OPTIONAL AREA]
          Add other sections here later if needed. */}
    </main>
  )
}
