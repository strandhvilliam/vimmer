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

function mapDbRuleConfigsToValidationConfigs(
  dbRuleConfigs: DbRuleConfig[]
): RuleConfig<RuleKey>[] {
  return dbRuleConfigs
    .filter((rule) => rule.enabled) // Only include enabled rules
    .map((rule) => {
      const ruleKey = rule.ruleKey as RuleKey;
      const severity = rule.severity as "error" | "warning";

      return createRule(ruleKey, severity, rule.params as any);
    });
}

export default async function SubmissionPage() {
  const domain = await getDomain();

  const [marathon, topics, competitionClasses, deviceGroups, rules] =
    await Promise.all([
      getMarathonByDomain(domain),
      getTopicsByDomain(domain),
      getCompetitionClassesByDomain(domain),
      getDeviceGroupsByDomain(domain),
      getRulesByDomain(domain),
    ]);

  if (!marathon) {
    notFound();
  }

  const ruleConfigs = mapDbRuleConfigsToValidationConfigs(rules);

  return (
    <SubmissionClientPage
      marathon={marathon}
      topics={topics}
      competitionClasses={competitionClasses}
      deviceGroups={deviceGroups}
      ruleConfigs={ruleConfigs}
    />
  );
}
