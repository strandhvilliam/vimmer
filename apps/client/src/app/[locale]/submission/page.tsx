import { SubmissionClientPage } from "./client-page";
import { createClient } from "@vimmer/supabase/server";
import { notFound } from "next/navigation";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getMarathonByDomain,
  getRulesByDomain,
  getRulesByMarathonId,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { RuleConfig, RuleKey } from "@vimmer/validation/types";
import { createRule } from "@vimmer/validation/validator";
import { RuleConfig as DbRuleConfig } from "@vimmer/supabase/types";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export default async function SubmissionPage() {
  const domain = await getDomain();

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
    trpc.rules.getByDomain.queryOptions({
      domain,
    }),
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <SubmissionClientPage />
    </HydrateClient>
  );
}
