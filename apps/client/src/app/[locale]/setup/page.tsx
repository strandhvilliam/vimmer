import { createClient } from "@vimmer/supabase/server";
import { LanguageSelectionPage } from "./client-page";
import { getMarathonWithConfigByDomain } from "@vimmer/supabase/queries";
import { notFound } from "next/navigation";

export default async function SetupPage() {
  const supabase = await createClient();
  const domain = "dev0";
  const marathon = await getMarathonWithConfigByDomain(supabase, domain);

  if (!marathon) {
    notFound();
  }

  return <LanguageSelectionPage marathon={marathon} />;
}
