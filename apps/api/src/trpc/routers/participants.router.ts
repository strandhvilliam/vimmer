import {
  createParticipantMutation,
  deleteParticipantMutation,
  getParticipantByIdQuery,
  getParticipantsByDomainQuery,
  updateParticipantMutation,
} from "@/db/queries/participants.queries";
import { createTRPCRouter, publicProcedure } from "../init";
import {
  createParticipantSchema,
  deleteParticipantSchema,
  getParticipantByIdSchema,
  getParticipantsByDomainSchema,
  updateParticipantSchema,
} from "@/schemas/participants.schemas";

export const participantsRouter = createTRPCRouter({
  getParticipants: publicProcedure
    .input(getParticipantsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getParticipantsByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),

  getParticipantById: publicProcedure
    .input(getParticipantByIdSchema)
    .query(async ({ ctx, input }) => {
      return getParticipantByIdQuery(ctx.db, {
        id: input.id,
      });
    }),

  createParticipant: publicProcedure
    .input(createParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      return createParticipantMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateParticipant: publicProcedure
    .input(updateParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      return updateParticipantMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  deleteParticipant: publicProcedure
    .input(deleteParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteParticipantMutation(ctx.db, {
        id: input.id,
      });
    }),
});
