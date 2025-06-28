import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  redirect("/setup");
}
