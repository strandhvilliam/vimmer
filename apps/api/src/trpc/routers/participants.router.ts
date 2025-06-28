import {
  createParticipantMutation,
  deleteParticipantMutation,
  getParticipantByIdQuery,
  getParticipantByReferenceQuery,
  getParticipantsByDomainQuery,
  incrementUploadCounterMutation,
  updateParticipantMutation,
} from "@vimmer/api/db/queries/participants.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  createParticipantSchema,
  deleteParticipantSchema,
  getParticipantByIdSchema,
  getParticipantByReferenceSchema,
  getParticipantsByDomainSchema,
  incrementUploadCounterSchema,
  updateParticipantSchema,
} from "@vimmer/api/schemas/participants.schemas";

export const participantsRouter = createTRPCRouter({
  getByDomain: publicProcedure
    .input(getParticipantsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getParticipantsByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),

  getById: publicProcedure
    .input(getParticipantByIdSchema)
    .query(async ({ ctx, input }) => {
      return getParticipantByIdQuery(ctx.db, {
        id: input.id,
      });
    }),

  getByReference: publicProcedure
    .input(getParticipantByReferenceSchema)
    .query(async ({ ctx, input }) => {
      return getParticipantByReferenceQuery(ctx.db, {
        reference: input.reference,
        domain: input.domain,
      });
    }),

  create: publicProcedure
    .input(createParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      return createParticipantMutation(ctx.db, {
        data: input.data,
      });
    }),

  update: publicProcedure
    .input(updateParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      return updateParticipantMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  delete: publicProcedure
    .input(deleteParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteParticipantMutation(ctx.db, {
        id: input.id,
      });
    }),

  incrementUploadCounter: publicProcedure
    .input(incrementUploadCounterSchema)
    .mutation(async ({ ctx, input }) => {
      return incrementUploadCounterMutation(ctx.supabase, {
        participantId: input.participantId,
        totalExpected: input.totalExpected,
      });
    }),
});
