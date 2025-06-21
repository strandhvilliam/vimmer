import { SetupClientPage } from "./client-page";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { notFound } from "next/navigation";
import { getDomain } from "@/lib/get-domain";

export default async function SetupPage() {
  const domain = await getDomain();
  const marathon = await getMarathonByDomain(domain);

  if (!marathon) {
    notFound();
  }

  return <SetupClientPage marathon={marathon} />;
}
