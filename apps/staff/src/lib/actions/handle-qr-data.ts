import { createClient } from "@vimmer/supabase/server";
import { qrDataSchema } from "../schemas/qr-data-schema";
import { actionClient } from "./safe-action";
import { getParticipantById } from "@vimmer/supabase/queries";
import { returnValidationErrors } from "next-safe-action";

export const handleQrData = actionClient
  .schema(qrDataSchema)
  .action(async ({ parsedInput: { pid } }) => {
    const supabase = await createClient();

    const participant = await getParticipantById(supabase, pid);

    if (!participant) {
      returnValidationErrors(qrDataSchema, {
        pid: {
          _errors: ["The provided PID does not match any participant"],
        },
      });
    }

    // check and validate to make sure the participant has not already been verified

    return participant;
  });
