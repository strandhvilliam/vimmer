"use server";

import { actionClient } from "@/lib/actions/safe-action";
import { createClient } from "@vimmer/supabase/server";
import { revalidateTag } from "next/cache";
import {
  updateMarathonByDomain,
  updateRuleConfigByMarathonIdAndRuleKey,
} from "@vimmer/supabase/mutations";
import { InsertMarathon } from "@vimmer/supabase/types";
import {
  updateMarathonSettingsSchema,
  UpdateSettingsInput,
} from "@/lib/schemas";
import {
  marathonByDomainTag,
  rulesByDomainTag,
  rulesByMarathonIdTag,
} from "@vimmer/supabase/cache-tags";
import { RULE_KEYS } from "@vimmer/validation/constants";

export const updateMarathonSettingsAction = actionClient
  .schema(updateMarathonSettingsSchema)
  .action(async ({ parsedInput }: { parsedInput: UpdateSettingsInput }) => {
    const { domain, ...settings } = parsedInput;
    const supabase = await createClient();

    const updateData: Partial<InsertMarathon> = {
      name: settings.name,
      startDate: settings.startDate
        ? settings.startDate.toISOString()
        : undefined,
      endDate: settings.endDate ? settings.endDate.toISOString() : undefined,
      description: settings.description,
      logoUrl: settings.logoUrl,
      languages: settings.languages ? settings.languages.join(",") : undefined,
    };

    const updatedMarathon = await updateMarathonByDomain(
      supabase,
      domain,
      updateData
    );

    if (
      (settings.startDate !== undefined || settings.endDate !== undefined) &&
      updatedMarathon
    ) {
      try {
        const withinTimerangeParams = {
          start: settings.startDate
            ? settings.startDate.toISOString()
            : updatedMarathon.startDate || "",
          end: settings.endDate
            ? settings.endDate.toISOString()
            : updatedMarathon.endDate || "",
        };

        await updateRuleConfigByMarathonIdAndRuleKey(
          supabase,
          updatedMarathon.id,
          RULE_KEYS.WITHIN_TIMERANGE,
          {
            params: withinTimerangeParams,
          }
        );

        revalidateTag(rulesByMarathonIdTag({ marathonId: updatedMarathon.id }));
        revalidateTag(rulesByDomainTag({ domain }));
      } catch (error) {
        // If the rule doesn't exist or update fails, continue silently
        // This is expected if the within_timerange rule hasn't been configured yet
        console.log(
          "No within_timerange rule config to update or update failed:",
          error
        );
      }
    }

    revalidateTag(marathonByDomainTag({ domain }));

    return updatedMarathon;
  });
