import {
  getJuryInvitationsByMarathonIdQuery,
  getJuryInvitationsByDomainQuery,
  getJurySubmissionsQuery,
  getJuryInvitationByIdQuery,
  createJuryInvitationMutation,
  updateJuryInvitationMutation,
  deleteJuryInvitationMutation,
  verifyJuryTokenAndGetDataQuery,
  getJuryParticipantsQuery,
  getJuryParticipantSubmissionsQuery,
  createJuryRatingMutation,
  updateJuryRatingMutation,
  getJuryRatingQuery,
  deleteJuryRatingMutation,
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
  verifyJuryTokenSchema,
  getJuryParticipantsSchema,
  getJuryParticipantSubmissionsSchema,
  createJuryRatingSchema,
  updateJuryRatingSchema,
  getJuryRatingSchema,
  deleteJuryRatingSchema,
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

  verifyTokenAndGetData: publicProcedure
    .input(verifyJuryTokenSchema)
    .query(async ({ ctx, input }) => {
      return verifyJuryTokenAndGetDataQuery(ctx.db, {
        token: input.token,
      });
    }),

  getParticipants: publicProcedure
    .input(getJuryParticipantsSchema)
    .query(async ({ ctx, input }) => {
      return getJuryParticipantsQuery(ctx.db, {
        token: input.token,
      });
    }),

  getParticipantSubmissions: publicProcedure
    .input(getJuryParticipantSubmissionsSchema)
    .query(async ({ ctx, input }) => {
      return getJuryParticipantSubmissionsQuery(ctx.db, {
        token: input.token,
        participantId: input.participantId,
      });
    }),

  createRating: publicProcedure
    .input(createJuryRatingSchema)
    .mutation(async ({ ctx, input }) => {
      return createJuryRatingMutation(ctx.db, {
        token: input.token,
        participantId: input.participantId,
        rating: input.rating,
        notes: input.notes,
      });
    }),

  updateRating: publicProcedure
    .input(updateJuryRatingSchema)
    .mutation(async ({ ctx, input }) => {
      return updateJuryRatingMutation(ctx.db, {
        token: input.token,
        participantId: input.participantId,
        rating: input.rating,
        notes: input.notes,
      });
    }),

  getRating: publicProcedure
    .input(getJuryRatingSchema)
    .query(async ({ ctx, input }) => {
      return getJuryRatingQuery(ctx.db, {
        token: input.token,
        participantId: input.participantId,
      });
    }),

  deleteRating: publicProcedure
    .input(deleteJuryRatingSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteJuryRatingMutation(ctx.db, {
        token: input.token,
        participantId: input.participantId,
      });
    }),
});
