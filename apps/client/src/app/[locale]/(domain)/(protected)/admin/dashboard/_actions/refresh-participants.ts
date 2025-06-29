"use server";

import { revalidateTag } from "next/cache";
import { participantsByDomainTag } from "@vimmer/supabase/cache-tags";
import { actionClient } from "@/lib/actions/safe-action";
import { z } from "zod";

const refreshParticipantsDataSchema = z.object({
  domain: z.string(),
});

export const refreshParticipantsData = actionClient
  .schema(refreshParticipantsDataSchema)
  .action(async ({ parsedInput: { domain } }) => {
    revalidateTag(participantsByDomainTag({ domain }));

    return {
      refreshedAt: new Date().toISOString(),
      success: true,
    };
  });
