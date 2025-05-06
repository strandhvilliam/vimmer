"use server";

import { z } from "zod";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "@/lib/actions/safe-action";
import { createParticipantVerification } from "@vimmer/supabase/mutations";

const verifyParticipantSchema = z.object({
  participantId: z.number().int().positive(),
});

export const verifyParticipant = actionClient
  .schema(verifyParticipantSchema)
  .action(async ({ parsedInput: { participantId } }) => {
    // verify logged in staff

    const supabase = await createClient();

    const participant = await createParticipantVerification(supabase, {
      participantId: participantId,
      staffId: "1",
    });

    // Update the participant status to verified
    // status: "verified",

    // Input participant verification record

    //
  });
