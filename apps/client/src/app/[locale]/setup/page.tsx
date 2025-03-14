import { createClient } from "@vimmer/supabase/server";
import { LanguageSelectionPage } from "./client-page";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { notFound } from "next/navigation";

export default async function SetupPage() {
  const domain = "dev0";
  const marathon = await getMarathonByDomain(domain);

  if (!marathon) {
    notFound();
  }

  return <LanguageSelectionPage marathon={marathon} />;
}
