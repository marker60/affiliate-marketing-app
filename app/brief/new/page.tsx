// app/brief/new/page.tsx
export const dynamic = "force-dynamic";

export default function NewBriefPage() {
  async function saveBrief(formData: FormData) {
    "use server";
    const payload = {
      title: formData.get("title"),
      html: formData.get("html"),
      source_url: formData.get("source_url"),
    };
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/brief/save`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Save failed");
  }

  return (
    <form action={saveBrief} className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">New Brief</h1>
      <input name="title" placeholder="Title" className="w-full rounded border px-3 py-2" />
      <input name="source_url" placeholder="Original URL (optional)" className="w-full rounded border px-3 py-2" />
      <textarea name="html" placeholder="Paste HTML" rows={12} className="w-full rounded border px-3 py-2" />
      <button className="px-4 py-2 rounded bg-green-600 hover:bg-green-500">Save</button>
    </form>
  );
}
