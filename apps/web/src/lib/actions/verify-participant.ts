"use server";

import { z } from "zod";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "@/lib/actions/safe-action";
import { createParticipantVerification } from "@vimmer/supabase/mutations";
import { getSession } from "@/lib/auth";
import { updateParticipant } from "@vimmer/supabase/mutations";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  participantByReferenceTag,
  participantsByDomainTag,
} from "@vimmer/supabase/cache-tags";

const verifyParticipantSchema = z.object({
  participantId: z.number().int().positive(),
});

export const verifyParticipant = actionClient
  .schema(verifyParticipantSchema)
  .action(async ({ parsedInput: { participantId } }) => {
    const sessionData = await getSession();

    if (!sessionData) {
      throw new Error("Not authenticated");
    }

    const staffId = sessionData.user.id;
    const supabase = await createClient();

    const verification = await createParticipantVerification(supabase, {
      participantId,
      staffId,
    });

    const participant = await updateParticipant(supabase, participantId, {
      status: "verified",
    });

    revalidateTag(`participant-verifications-${staffId}`);
    revalidateTag(
      participantByReferenceTag({
        domain: participant.domain,
        reference: participant.reference,
      })
    );
    revalidateTag(participantsByDomainTag({ domain: participant.domain }));
    revalidatePath(`/staff`);

    return verification;
  });
