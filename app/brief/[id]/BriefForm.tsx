// app/brief/[id]/BriefForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BriefForm({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const fd = new FormData();
    fd.append("projectId", projectId);
    fd.append("productUrl", url);
    const res = await fetch("/api/brief", { method: "POST", body: fd, credentials: "same-origin" });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(()=>({error:"failed"}));
      setErr(j.error || "failed");
      return;
    }
    router.push(window.location.pathname + "?r=" + Date.now());
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {err && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">Error: {err}</div>}
      <label className="block">
        <span className="text-sm">Product URL</span>
        <input
          value={url}
          onChange={(e)=>setUrl(e.target.value)}
          placeholder="https://example.com/product"
          className="mt-1 w-full border rounded p-2"
          required
        />
      </label>
      <button disabled={loading} type="submit" className="px-4 py-2 rounded bg-black text-white">
        {loading ? "Working…" : "Generate Brief"}
      </button>
    </form>
  );
}
