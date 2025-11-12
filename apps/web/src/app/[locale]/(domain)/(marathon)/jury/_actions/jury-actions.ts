"use server"

import { createClient } from "../../../../../../../../../packages/supabase/src/clients/server"
import { actionClient } from "@/actions/safe-action"
import { z } from "zod"
import { updateJuryInvitation } from "../../../../../../../../../packages/supabase/src/mutations"
import { revalidatePath } from "next/cache"

const updateInvitationStatusSchema = z.object({
  invitationId: z.number(),
  status: z.enum(["pending", "in_progress", "completed"]),
})

export const updateInvitationStatusAction = actionClient
  .schema(updateInvitationStatusSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()

    const updatedInvitation = await updateJuryInvitation(supabase, parsedInput.invitationId, {
      status: parsedInput.status,
    })

    return updatedInvitation
  })
