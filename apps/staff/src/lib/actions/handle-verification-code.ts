"use server";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import { createClient } from "@vimmer/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { verificationDataSchema } from "../schemas/verification-data-schema";
import { actionClient } from "./safe-action";

export const handleVerificationCode = actionClient
  .schema(verificationDataSchema)
  .action(async ({ parsedInput: { reference, domain } }) => {
    const participant = await getParticipantByReference(domain, reference);

    if (!participant) {
      returnValidationErrors(verificationDataSchema, {
        reference: {
          _errors: ["The provided PID does not match any participant"],
        },
      });
    }

    if (participant.status === "verified") {
      returnValidationErrors(verificationDataSchema, {
        reference: {
          _errors: ["This participant has already been verified"],
        },
      });
    }
    return participant;
  });
