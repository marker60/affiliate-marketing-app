// Server component: renders a saved brief by id
import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// server-only Supabase (admin) — same env fallbacks as API
function admin() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole =
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Supabase envs missing on server");
  }
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

type Brief = {
  id: string;
  url: string | null;
  title: string | null;
  markdown?: string | null;
  html?: string | null;
  created_at?: string | null;
};

export default async function BriefDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const db = admin();
  const { data, error } = await db
    .from("briefs")
    .select("id,url,title,markdown,created_at")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-3xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Brief not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-70">
              {error?.message ?? "We couldn’t load that brief."}
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="secondary">
                <Link href="/briefs">Back to Briefs</Link>
              </Button>
              <Button asChild>
                <Link href="/brief/quick">Create New</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brief = data as Brief;
  const isLocal = brief.url?.startsWith("local://");

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {brief.title || "(untitled brief)"}
          </h1>
          <div className="mt-1 text-xs opacity-70">
            ID: <span className="font-mono">{brief.id}</span>
            {brief.created_at ? (
              <>
                {" "}• {new Date(brief.created_at).toLocaleString()}
              </>
            ) : null}
          </div>
          {brief.url ? (
            <div className="mt-1 text-xs opacity-80 break-words">
              Source:{" "}
              {isLocal ? (
                <span className="font-mono">{brief.url}</span>
              ) : (
                <a
                  href={brief.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {brief.url}
                </a>
              )}
            </div>
          ) : null}
        </div>
        <div className="shrink-0 flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/briefs">All Briefs</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dev">Dev</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent>
          {brief.markdown ? (
            <article className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {brief.markdown}
              </ReactMarkdown>
            </article>
          ) : (
            <p className="text-sm opacity-70">
              This brief has no markdown body saved. It was likely created with a
              minimal schema. You can still keep it as a bookmark, or recreate it
              via Quick Brief (From HTML).
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
