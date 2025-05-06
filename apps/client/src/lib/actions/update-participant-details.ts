"use server";
import { updateParticipant } from "@vimmer/supabase/mutations";
import { createClient } from "@vimmer/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { actionClient, ActionError } from "./safe-action";
import { updateParticipantDetailsSchema } from "../lib/schemas/update-participant-details-schema";
import { revalidateTag } from "next/cache";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";

export const updateParticipantDetails = actionClient
  .schema(updateParticipantDetailsSchema)
  .action(
    async ({
      parsedInput: { participantRef, domain, firstname, lastname, email },
    }) => {
      const participant = await getParticipantByReference(
        domain,
        participantRef
      );

      if (!participant) {
        throw new ActionError(`Participant "${participantRef}" not found`);
      }

      if (
        participant.firstname === firstname &&
        participant.lastname === lastname &&
        participant.email === email
      ) {
        return participant;
      }

      const supabase = await createClient();
      const updatedParticipant = await updateParticipant(
        supabase,
        participant.id,
        {
          firstname,
          lastname,
          email,
        }
      );

      if (!updatedParticipant) {
        throw new ActionError(
          `Failed to update participant "${participantRef}"`
        );
      }

      revalidateTag(`participant-${domain}-${participantRef}`);

      return updatedParticipant;
    }
  );
