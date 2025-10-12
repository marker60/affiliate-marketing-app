// app/briefs/page.tsx
import { redirect } from "next/navigation";

export default function LegacyBriefsRedirect() {
  redirect("/brief");
}
