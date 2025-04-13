"use server";
import { initializeParticipantSchema } from "@/schemas/initialize-participant-schema";
import { createParticipant } from "@vimmer/supabase/mutations";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import { createClient } from "@vimmer/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { actionClient, ActionError } from "./safe-action";
import { revalidateTag } from "next/cache";

export const initializeParticipant = actionClient
  .schema(initializeParticipantSchema)
  .action(async ({ parsedInput: { participantRef, marathonId, domain } }) => {
    const supabase = await createClient();

    const existingParticipant = await getParticipantByReference(
      domain,
      participantRef
    );

    if (existingParticipant !== null) {
      returnValidationErrors(initializeParticipantSchema, {
        participantRef: {
          _errors: ["Participant already exists"],
        },
      });
    }

    const participant = await createParticipant(supabase, {
      reference: participantRef,
      marathonId,
      domain,
    });

    if (!participant) {
      throw new ActionError(`Failed to create participant "${participantRef}"`);
    }

    revalidateTag(`participant-${domain}-${participantRef}`);

    return participant;
  });
