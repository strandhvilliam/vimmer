import {
  createParticipantMutation,
  deleteParticipantMutation,
  getParticipantByIdQuery,
  getParticipantByReferenceQuery,
  getParticipantsByDomainQuery,
  incrementUploadCounterMutation,
  updateParticipantMutation,
} from "@vimmer/api/db/queries/participants.queries"
import { createTRPCRouter, publicProcedure } from ".."
import {
  createParticipantSchema,
  deleteParticipantSchema,
  getParticipantByIdSchema,
  getParticipantByReferenceSchema,
  getParticipantsByDomainSchema,
  incrementUploadCounterSchema,
  updateParticipantSchema,
} from "@vimmer/api/schemas/participants.schemas"
import { TRPCError } from "@trpc/server"
import { invalidateCloudfrontByDomain } from "@vimmer/api/utils/invalidate-cloudfront-domain"

export const participantsRouter = createTRPCRouter({
  getByDomain: publicProcedure
    .input(getParticipantsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getParticipantsByDomainQuery(ctx.db, {
        domain: input.domain,
      })
    }),

  getById: publicProcedure
    .input(getParticipantByIdSchema)
    .query(async ({ ctx, input }) => {
      const data = await getParticipantByIdQuery(ctx.db, {
        id: input.id,
      })

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Participant not found",
        })
      }
      return data
    }),

  getByReference: publicProcedure
    .input(getParticipantByReferenceSchema)
    .query(async ({ ctx, input }) => {
      return getParticipantByReferenceQuery(ctx.db, {
        reference: input.reference,
        domain: input.domain,
      })
    }),

  create: publicProcedure
    .input(createParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      return createParticipantMutation(ctx.db, {
        data: input.data,
      })
    }),

  update: publicProcedure
    .input(updateParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      return updateParticipantMutation(ctx.db, {
        id: input.id,
        data: input.data,
      })
    }),

  delete: publicProcedure
    .input(deleteParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      const participant = await getParticipantByIdQuery(ctx.db, {
        id: input.id,
      })

      if (!participant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Participant not found",
        })
      }

      await deleteParticipantMutation(ctx.db, {
        id: input.id,
      })
      await invalidateCloudfrontByDomain(participant.domain)
    }),

  incrementUploadCounter: publicProcedure
    .input(incrementUploadCounterSchema)
    .mutation(async ({ ctx, input }) => {
      return incrementUploadCounterMutation(ctx.supabase, {
        participantId: input.participantId,
        totalExpected: input.totalExpected,
      })
    }),
})
