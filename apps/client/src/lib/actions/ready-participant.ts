"use server";
import { readyParticipantSchema } from "@/lib/schemas/ready-participant-schema";
import { actionClient } from "../safe-action";
import { updateParticipant } from "@vimmer/supabase/mutations";
import { createClient } from "@vimmer/supabase/server";

export const readyParticipant = actionClient
  .schema(readyParticipantSchema)
  .action(
    async ({
      parsedInput: { participantId, competitionClassId, deviceGroupId },
    }) => {
      const supabase = await createClient();
      await updateParticipant(supabase, participantId, {
        competitionClassId,
        deviceGroupId,
        status: "ready_to_upload",
      });
    },
  );
