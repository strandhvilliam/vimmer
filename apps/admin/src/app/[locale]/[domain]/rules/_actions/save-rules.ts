"use server";

import { actionClient } from "@/lib/safe-action";
import { rulesFormSchema, RulesFormValues } from "../_lib/schemas";
import { cookies } from "next/headers";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { createClient } from "@vimmer/supabase/server";
import { InsertRuleConfig } from "@vimmer/supabase/types";
import { RULE_KEYS } from "@vimmer/validation/constants";
import { revalidateTag } from "next/cache";
import { rulesByMarathonIdTag } from "@vimmer/supabase/cache-tags";

export const saveRules = actionClient
  .schema(rulesFormSchema)
  .action(async ({ parsedInput: rules }) => {
    try {
      // Get domain from cookies
      const cookieStore = await cookies();
      const domain = cookieStore.get("activeDomain")?.value;

      if (!domain) {
        throw new Error("No domain found");
      }

      // Get marathon by domain
      const marathon = await getMarathonByDomain(domain);
      if (!marathon) {
        throw new Error("Marathon not found");
      }

      const supabase = await createClient();

      // Delete existing rule configs for this marathon
      await supabase
        .from("rule_configs")
        .delete()
        .eq("marathon_id", marathon.id)
        .throwOnError();

      // Transform form data to rule configs
      const ruleConfigs: InsertRuleConfig[] = [];

      // Map form keys to database rule keys and prepare insert data
      const ruleMapping: Record<keyof RulesFormValues, string> = {
        max_file_size: RULE_KEYS.MAX_FILE_SIZE,
        allowed_file_types: RULE_KEYS.ALLOWED_FILE_TYPES,
        strict_timestamp_ordering: RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
        same_device: RULE_KEYS.SAME_DEVICE,
        within_timerange: RULE_KEYS.WITHIN_TIMERANGE,
        modified: RULE_KEYS.MODIFIED,
      };

      for (const [formKey, rule] of Object.entries(rules)) {
        const ruleKey = ruleMapping[formKey as keyof RulesFormValues];
        if (ruleKey && rule.enabled) {
          ruleConfigs.push({
            marathonId: marathon.id,
            ruleKey,
            enabled: rule.enabled,
            severity: rule.severity,
            params: rule.params,
          });
        }
      }

      // Insert new rule configs (bulk insert for efficiency)
      if (ruleConfigs.length > 0) {
        const { data } = await supabase
          .from("rule_configs")
          .insert(
            ruleConfigs.map((config) => ({
              marathon_id: config.marathonId,
              rule_key: config.ruleKey,
              enabled: config.enabled,
              severity: config.severity,
              params: config.params,
            }))
          )
          .select()
          .throwOnError();
      }

      // Revalidate cache
      revalidateTag(rulesByMarathonIdTag({ marathonId: marathon.id }));

      return {
        success: true,
        message: "Rules saved successfully",
      };
    } catch (error) {
      console.error("Error saving rules:", error);
      return {
        success: false,
        message: "Failed to save rules",
      };
    }
  });
