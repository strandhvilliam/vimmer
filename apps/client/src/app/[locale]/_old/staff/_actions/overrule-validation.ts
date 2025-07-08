"use server";
import { actionClient } from "@/lib/actions/safe-action";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@vimmer/supabase/server";
import { updateValidationResult } from "@vimmer/supabase/mutations";
import { revalidatePath, revalidateTag } from "next/cache";
import { getDomain } from "@/lib/get-domain";
import {
  participantByReferenceTag,
  participantsByDomainTag,
  participantVerificationsByStaffIdTag,
} from "@vimmer/supabase/cache-tags";

const overruleValidationSchema = z.object({
  validationResultId: z.number(),
  participantReference: z.string(),
});

export const overruleValidation = actionClient
  .schema(overruleValidationSchema)
  .action(
    async ({ parsedInput: { validationResultId, participantReference } }) => {
      const sessionData = await getSession();
      const domain = await getDomain();

      if (!sessionData) {
        redirect(`/staff/login`);
      }

      const supabase = await createClient();

      const data = await updateValidationResult(supabase, validationResultId, {
        overruled: true,
      });

      const staffId = sessionData.user.id;

      revalidateTag(participantVerificationsByStaffIdTag({ staffId }));
      revalidateTag(participantsByDomainTag({ domain }));
      revalidateTag(
        participantByReferenceTag({ domain, reference: participantReference })
      );
      revalidatePath(`/staff`);

      return data;
    }
  );
