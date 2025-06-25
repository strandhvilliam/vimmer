"use server";

import { z } from "zod";
import { actionClient, ActionError } from "@/lib/safe-action";
import { updateParticipant } from "@vimmer/supabase/mutations";
import { createClient } from "@vimmer/supabase/server";
import { revalidateTag } from "next/cache";
import {
  participantByReferenceTag,
  participantsByDomainTag,
} from "@vimmer/supabase/cache-tags";

const verifyParticipantSchema = z.object({
  participantId: z.number().int().positive(),
  domain: z.string(),
  reference: z.string(),
});

export const verifyParticipant = actionClient
  .schema(verifyParticipantSchema)
  .action(async ({ parsedInput: { participantId, domain, reference } }) => {
    const supabase = await createClient();

    try {
      const updatedParticipant = await updateParticipant(
        supabase,
        participantId,
        {
          status: "verified",
        }
      );

      if (!updatedParticipant) {
        throw new ActionError("Failed to verify participant");
      }

      // Revalidate the participant data in cache
      revalidateTag(participantByReferenceTag({ domain, reference }));
      revalidateTag(participantsByDomainTag({ domain }));

      return updatedParticipant;
    } catch (error) {
      console.error("Error verifying participant:", error);
      throw new ActionError("Failed to verify participant");
    }
  });
