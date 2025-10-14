// [LABEL: FILE] app/api/brief/save/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { BriefUpdate, formatZodError } from "@/lib/validation/brief";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = BriefUpdate.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { id, ...rest } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("briefs")
      .update(rest)
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data!.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
