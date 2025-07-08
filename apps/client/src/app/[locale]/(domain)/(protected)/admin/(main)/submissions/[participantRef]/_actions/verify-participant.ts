"use server";

import { z } from "zod";
import { actionClient, ActionError } from "@/lib/actions/safe-action";
import { createServerApiClient } from "@/trpc/server";
import { revalidateTag } from "next/cache";

const verifyParticipantSchema = z.object({
  participantId: z.number().int().positive(),
  domain: z.string(),
  reference: z.string(),
});

export const verifyParticipant = actionClient
  .schema(verifyParticipantSchema)
  .action(async ({ parsedInput: { participantId, domain, reference } }) => {
    const trpc = createServerApiClient();

    try {
      const updatedParticipant = await trpc.participants.update.mutate({
        id: participantId,
        data: {
          status: "verified",
        },
      });

      if (!updatedParticipant) {
        throw new ActionError("Failed to verify participant");
      }

      // Revalidate the participant data in cache
      revalidateTag(`participants-by-reference-${domain}-${reference}`);
      revalidateTag(`participants-by-domain-${domain}`);

      return updatedParticipant;
    } catch (error) {
      console.error("Error verifying participant:", error);
      throw new ActionError("Failed to verify participant");
    }
  });
