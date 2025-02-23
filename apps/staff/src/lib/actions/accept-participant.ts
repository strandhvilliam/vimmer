"use server";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "./safe-action";
import { acceptParticipantSchema } from "../schemas/accept-participant-schema";
import { updateParticipant } from "@vimmer/supabase/mutations";

export const acceptParticipant = actionClient
  .schema(acceptParticipantSchema)
  .action(async ({ parsedInput: { pid } }) => {
    const supabase = await createClient();
    await updateParticipant(supabase, pid, {
      status: "verified",
    });
  });
