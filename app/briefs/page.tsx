// app/briefs/page.tsx
import { redirect } from "next/navigation";

export default function BriefsRedirectPage() {
  // Unify on /brief for the list view
  redirect("/brief");
}
