'use server'
import { actionClient, ActionError } from '@/utils/safe-action'
import { createParticipant } from '@vimmer/supabase/mutations'
import { getParticipantByRefQuery } from '@vimmer/supabase/queries'
import { createClient } from '@vimmer/supabase/server'
import { z } from 'zod'

const createParticipantSchema = z.object({
  participantRef: z.string(),
})

export const initializeParticipant = actionClient
  .schema(createParticipantSchema)
  .action(async ({ parsedInput }) => {
    const { participantRef } = parsedInput
    const supabase = await createClient()

    const { data: existingParticipant, error: checkExistingError } =
      await getParticipantByRefQuery(supabase, participantRef)

    if (!!existingParticipant) {
      throw new ActionError(`Participant "${participantRef}]" already exists`)
    }

    if (checkExistingError) {
      throw new ActionError(
        `Unable to intialize participant`,
        checkExistingError,
      )
    }

    const { data: participant, error: createError } = await createParticipant(
      supabase,
      {
        ref: participantRef,
      },
    )
    if (createError || null) {
      throw new ActionError(
        `Failed to create participant ${participantRef}`,
        createError || new Error('Function returned null'),
      )
    }
    return participant
  })
