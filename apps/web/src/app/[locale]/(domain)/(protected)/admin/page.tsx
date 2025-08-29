import { redirect } from "next/navigation";

export default async function AdminIndexPage() {
  redirect(`/admin/submissions`);
}
