"use server";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import { returnValidationErrors } from "next-safe-action";
import { verificationDataSchema } from "@/lib/schemas/verification-data-schema";
import { actionClient } from "@/lib/actions/safe-action";
import { getSession } from "../auth";

export const handleVerificationCode = actionClient
  .schema(verificationDataSchema)
  .action(async ({ parsedInput: { reference, domain } }) => {
    const sessionData = await getSession();

    if (!sessionData) {
      returnValidationErrors(verificationDataSchema, {
        reference: {
          _errors: ["You must be logged in to verify a participant"],
        },
      });
    }
    const participant = await getParticipantByReference(domain, reference);

    if (!participant) {
      returnValidationErrors(verificationDataSchema, {
        reference: {
          _errors: [
            "The provided participant number does not match any participant",
          ],
        },
      });
    }

    return participant;
  });
