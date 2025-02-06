"use server";
import { initParticipantSchema } from "@/lib/schemas/init-participant-schema";
import { actionClient, ActionError } from "@/lib/safe-action";
import { createParticipant } from "@vimmer/supabase/mutations";
import { getParticipantByReference } from "@vimmer/supabase/queries";
import { createClient } from "@vimmer/supabase/server";
import { z } from "zod";
import { returnValidationErrors } from "next-safe-action";

export const initializeParticipant = actionClient
  .schema(initParticipantSchema)
  .action(async ({ parsedInput: { participantRef, marathonId } }) => {
    const supabase = await createClient();

    const existingParticipant = await getParticipantByReference(
      supabase,
      participantRef,
      marathonId,
    );

    if (existingParticipant !== null) {
      returnValidationErrors(initParticipantSchema, {
        participantRef: {
          _errors: ["Participant already exists"],
        },
      });
    }

    const participant = await createParticipant(supabase, {
      reference: participantRef,
      marathonId,
    });

    if (!participant) {
      throw new ActionError(`Failed to create participant "${participantRef}"`);
    }

    return participant;
  });
