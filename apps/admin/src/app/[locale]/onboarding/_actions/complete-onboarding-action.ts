"use server";

import { createClient } from "@vimmer/supabase/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import {
  createCompetitionClass,
  createDeviceGroup,
  addRuleConfig,
  updateMarathonByDomain,
  createTopic,
} from "@vimmer/supabase/mutations";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { redirect } from "next/navigation";

const completeOnboardingSchema = z.object({
  marathonConfig: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
  competitionClasses: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      numberOfPhotos: z.number(),
      topicStartIndex: z.number().optional(),
    })
  ),
  deviceGroups: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      icon: z.string().default("camera"),
    })
  ),
  validationRules: z.array(
    z.object({
      ruleKey: z.string(),
      severity: z.enum(["warning", "error"]),
      params: z.any().optional(),
    })
  ),
  topics: z.array(
    z.object({
      name: z.string(),
      visibility: z.enum(["public", "private", "scheduled"]),
      scheduledStart: z.string().nullable().optional(),
      orderIndex: z.number(),
    })
  ),
});

export const completeOnboardingAction = actionClient
  .schema(completeOnboardingSchema)
  .action(async ({ parsedInput }) => {
    const cookieStore = await cookies();
    const domain = cookieStore.get("activeDomain")?.value;

    if (!domain) {
      throw new Error("No domain found");
    }

    const marathon = await getMarathonByDomain(domain);
    if (!marathon) {
      throw new Error("Marathon not found");
    }

    const supabase = await createClient();

    try {
      // 1. Update marathon configuration and mark as setup complete
      const marathonUpdates = {
        ...parsedInput.marathonConfig,
        setupCompleted: true,
      };

      await updateMarathonByDomain(supabase, domain, marathonUpdates);

      // 2. Create competition classes
      for (const competitionClass of parsedInput.competitionClasses) {
        await createCompetitionClass(supabase, {
          ...competitionClass,
          marathonId: marathon.id,
        });
      }

      // 3. Create device groups
      for (const deviceGroup of parsedInput.deviceGroups) {
        await createDeviceGroup(supabase, {
          ...deviceGroup,
          marathonId: marathon.id,
        });
      }

      // 4. Create validation rules
      for (const rule of parsedInput.validationRules) {
        await addRuleConfig(supabase, {
          ...rule,
          marathonId: marathon.id,
        });
      }

      // 5. Create topics
      for (const topic of parsedInput.topics) {
        await createTopic(supabase, {
          ...topic,
          marathonId: marathon.id,
        });
      }

      // Revalidate relevant cache tags
      revalidateTag(`marathon-${domain}`);
      revalidateTag(`competition-classes-${domain}`);
      revalidateTag(`device-groups-${domain}`);
      revalidateTag(`rule-configs-${domain}`);
      revalidateTag(`topics-${domain}`);

      return { success: true };
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw new Error("Failed to complete onboarding setup");
    }
  });
