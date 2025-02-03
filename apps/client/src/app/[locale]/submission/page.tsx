import { getMarathonWithConfigByDomain } from "@vimmer/supabase/queries";
import { SubmissionClientPage } from "./client-page";
import { createClient } from "@vimmer/supabase/server";

export default async function SubmissionPage() {
  const domain = "dev0";
  const supabase = await createClient();
  const marathon = await getMarathonWithConfigByDomain(supabase, domain);
  return <SubmissionClientPage marathon={marathon} />;
}
