import {
  getJuryInvitationsByMarathonIdQuery,
  getJuryInvitationsByDomainQuery,
  getJurySubmissionsQuery,
  getJuryInvitationByIdQuery,
  createJuryInvitationMutation,
  updateJuryInvitationMutation,
  deleteJuryInvitationMutation,
} from "@vimmer/api/db/queries/jury.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  getJuryInvitationsByMarathonIdSchema,
  getJuryInvitationsByDomainSchema,
  getJurySubmissionsSchema,
  getJuryInvitationByIdSchema,
  createJuryInvitationSchema,
  updateJuryInvitationSchema,
  deleteJuryInvitationSchema,
} from "@vimmer/api/schemas/jury.schemas";
import { generateJuryToken } from "@vimmer/api/utils/generate-jury-token";

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

  getJuryInvitationsByDomain: publicProcedure
    .input(getJuryInvitationsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getJuryInvitationsByDomainQuery(ctx.db, input);
    }),

  getJuryInvitationById: publicProcedure
    .input(getJuryInvitationByIdSchema)
    .query(async ({ ctx, input }) => {
      return getJuryInvitationByIdQuery(ctx.db, input);
    }),

  createJuryInvitation: publicProcedure
    .input(createJuryInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const id = await createJuryInvitationMutation(ctx.db, {
        data: input.data,
      });
      const token = await generateJuryToken(input.data.domain, id);
      await updateJuryInvitationMutation(ctx.db, {
        id,
        data: {
          token,
        },
      });
      return getJuryInvitationByIdQuery(ctx.db, { id });
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
