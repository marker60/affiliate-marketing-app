import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseServer } from "@/lib/supabase/server";

// Server action: sign out then go home
async function signOutAction() {
  "use server";
  const supabase = getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function Nav() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="flex items-center gap-3">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/dev" className="hover:underline">
        Dev
      </Link>
      <Link href="/brief" className="hover:underline">
        Briefs
      </Link>

      <div className="ml-3" />

      {user ? (
        <form action={signOutAction}>
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      ) : (
        <Link href="/login">
          <Button variant="outline" size="sm">Sign in</Button>
        </Link>
      )}
    </nav>
  );
}
