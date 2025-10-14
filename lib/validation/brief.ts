// [LABEL: FILE] lib/validation/brief.ts
import { z } from "zod";

export const BriefId = z.string().uuid("Invalid brief id");

export const BriefCreate = z.object({
  title: z.string().min(1, "Title is required"),
  source_url: z.string().url("Must be a valid URL").optional().nullable(),
  html: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

export const BriefUpdate = z.object({
  id: BriefId,
  title: z.string().min(1).optional(),
  source_url: z.string().url().optional().nullable(),
  html: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["new", "draft", "ready", "archived"]).optional(),
  tags: z.array(z.string()).optional().nullable(),
});

// Simple helper to turn Zod errors into a readable string
export function formatZodError(err: any) {
  // err is ZodError
  try {
    return err.issues
      .map((i: any) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
  } catch {
    return "Invalid request payload";
  }
}
