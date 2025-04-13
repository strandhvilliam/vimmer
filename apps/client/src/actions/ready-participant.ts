"use server";
import { readyParticipantSchema } from "@/schemas/ready-participant-schema";
import { actionClient, ActionError } from "./safe-action";
import { updateParticipant } from "@vimmer/supabase/mutations";
import { createClient } from "@vimmer/supabase/server";
import { revalidateTag } from "next/cache";

export const readyParticipant = actionClient
  .schema(readyParticipantSchema)
  .action(
    async ({
      parsedInput: {
        participantId,
        competitionClassId,
        deviceGroupId,
        firstname,
        lastname,
        email,
      },
    }) => {
      const supabase = await createClient();
      const updatedParticipant = await updateParticipant(
        supabase,
        participantId,
        {
          competitionClassId,
          deviceGroupId,
          status: "ready_to_upload",
          firstname,
          lastname,
          email,
        }
      );

      if (!updatedParticipant) {
        throw new ActionError("Failed to update participant");
      }

      revalidateTag(
        `participant-${updatedParticipant.domain}-${updatedParticipant.reference}`
      );

      return updatedParticipant;
    }
  );
