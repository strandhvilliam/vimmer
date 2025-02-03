"use server";
import { actionClient, ActionError } from "@/utils/safe-action";
import { createParticipant } from "@vimmer/supabase/mutations";
import { getParticipantByReference } from "@vimmer/supabase/queries";
import { createClient } from "@vimmer/supabase/server";
import { z } from "zod";

const createParticipantSchema = z.object({
  participantRef: z.string(),
});

export const initializeParticipant = actionClient
  .schema(createParticipantSchema)
  .action(async ({ parsedInput }) => {
    const { participantRef } = parsedInput;
    const supabase = await createClient();

    const { data: existingParticipant, error: checkExistingError } =
      await getParticipantByReference(supabase, participantRef);

    if (!!existingParticipant) {
      throw new ActionError(`Participant "${participantRef}]" already exists`);
    }

    if (checkExistingError) {
      throw new ActionError(
        `Unable to intialize participant`,
        checkExistingError,
      );
    }

    const participant = await createParticipant(supabase, {
      reference: participantRef,
    });
    return participant;
  });
