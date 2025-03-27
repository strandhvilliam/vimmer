import { SubmissionClientPage } from "./client-page";
import { createClient } from "@vimmer/supabase/server";
import { notFound } from "next/navigation";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getMarathonByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";

export default async function SubmissionPage() {
  const domain = "dev0";

  const [marathon, topics, competitionClasses, deviceGroups] =
    await Promise.all([
      getMarathonByDomain(domain),
      getTopicsByDomain(domain),
      getCompetitionClassesByDomain(domain),
      getDeviceGroupsByDomain(domain),
    ]);

  if (!marathon) {
    notFound();
  }

  return (
    <SubmissionClientPage
      marathon={marathon}
      topics={topics}
      competitionClasses={competitionClasses}
      deviceGroups={deviceGroups}
    />
  );
}
