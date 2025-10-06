// app/new/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-svh items-center justify-center p-8">
        <div className="max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold">Create New Project</h1>
          <p className="text-sm text-muted-foreground">
            Please sign in to continue.
          </p>
          <div className="flex gap-3">
            <a
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
              href="/auth/sign-up"
            >
              Sign up
            </a>
            <a className="px-4 py-2 rounded border" href="/auth/login">
              Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  async function createProject(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    if (!name) redirect("/new?error=missing_name");

    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData?.user;
    if (!currentUser) {
      // or: redirect("/auth/login")
      throw new Error("Not authenticated");
    }
    const userId = currentUser.id;

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ name, description, user_id: userId })
        .select("id")
        .single();

      if (error || !data) redirect("/new?error=save_failed");
      redirect(`/brief/${data.id}`);
    } catch {
      redirect("/new?error=save_failed");
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-8">
      <form action={createProject} className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold">New Project</h1>
        <label className="block">
          <span className="text-sm">Name</span>
          <input
            name="name"
            className="mt-1 w-full border rounded p-2"
            placeholder="e.g., Toaster X Review"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm">Description</span>
          <textarea
            name="description"
            className="mt-1 w-full border rounded p-2"
            rows={3}
            placeholder="Optional"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-primary-foreground"
        >
          Create
        </button>
      </form>
    </main>
  );
}
