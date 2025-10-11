import { redirect } from "next/navigation";

export default function NewPage() {
  // Keep a single source of truth for the creation form
  redirect("/brief/new");
}
