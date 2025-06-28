import {
  getJuryInvitationsByMarathonIdQuery,
  getJurySubmissionsQuery,
  getJuryInvitationByIdQuery,
  createJuryInvitationMutation,
  updateJuryInvitationMutation,
  deleteJuryInvitationMutation,
} from "@api/db/queries/jury.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  getJuryInvitationsByMarathonIdSchema,
  getJurySubmissionsSchema,
  getJuryInvitationByIdSchema,
  createJuryInvitationSchema,
  updateJuryInvitationSchema,
  deleteJuryInvitationSchema,
} from "@api/schemas/jury.schemas";

export const juryRouter = createTRPCRouter({
  getJurySubmissions: publicProcedure
    .input(getJurySubmissionsSchema)
    .query(async ({ ctx, input }) => {
      return getJurySubmissionsQuery(ctx.db, input);
    }),

  getJuryInvitationsByMarathonId: publicProcedure
    .input(getJuryInvitationsByMarathonIdSchema)
    .query(async ({ ctx, input }) => {
      return getJuryInvitationsByMarathonIdQuery(ctx.db, input);
    }),

  getJuryInvitationById: publicProcedure
    .input(getJuryInvitationByIdSchema)
    .query(async ({ ctx, input }) => {
      return getJuryInvitationByIdQuery(ctx.db, input);
    }),

  createJuryInvitation: publicProcedure
    .input(createJuryInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return createJuryInvitationMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateJuryInvitation: publicProcedure
    .input(updateJuryInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return updateJuryInvitationMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  deleteJuryInvitation: publicProcedure
    .input(deleteJuryInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteJuryInvitationMutation(ctx.db, {
        id: input.id,
      });
    }),
});
