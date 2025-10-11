"use server";

import { redirect } from "next/navigation";

/**
 * Create a brief by posting to our API.
 * Expects a <form> that sends: title, html_raw, and optional source_url/url.
 */
export async function generateBrief(formData: FormData) {
  const title = (formData.get("title") as string) || "";
  const html_raw = (formData.get("html_raw") as string) || "";
  const source_url = (formData.get("source_url") as string) || null;
  const url = (formData.get("url") as string) || null;

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/brief/create`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title, html_raw, source_url, url }),
    cache: "no-store",
  });

  if (!res.ok) {
    // On failure, go back to list; the page can show a toast if you wire one up.
    redirect("/brief");
  }

  const { id } = await res.json();
  redirect(`/brief/${id}`);
}

/**
 * Delete a brief and return to list.
 */
export async function deleteBrief(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  await fetch(`${base}/api/brief/delete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
    cache: "no-store",
  });
  redirect("/brief");
}
