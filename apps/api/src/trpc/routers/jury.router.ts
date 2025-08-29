import {
  getJuryInvitationsByMarathonIdQuery,
  getJuryInvitationsByDomainQuery,
  getJuryInvitationByIdQuery,
  createJuryInvitationMutation,
  updateJuryInvitationMutation,
  deleteJuryInvitationMutation,
  verifyJuryTokenAndGetDataQuery,
  createJuryRatingMutation,
  updateJuryRatingMutation,
  getJuryRatingQuery,
  deleteJuryRatingMutation,
  getJurySubmissionsFromTokenQuery,
  getJuryRatingsByInvitationQuery,
  getJuryParticipantCountQuery,
} from "@vimmer/api/db/queries/jury.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  getJuryInvitationsByMarathonIdSchema,
  getJuryInvitationsByDomainSchema,
  getJuryInvitationByIdSchema,
  createJuryInvitationSchema,
  updateJuryInvitationSchema,
  deleteJuryInvitationSchema,
  verifyJuryTokenSchema,
  createJuryRatingSchema,
  updateJuryRatingSchema,
  getJuryRatingSchema,
  deleteJuryRatingSchema,
  getJuryTopicParticipantsSchema,
  getJurySubmissionsFromTokenSchema,
  getJuryRatingsByInvitationSchema,
  getJuryParticipantCountSchema,
} from "@vimmer/api/schemas/jury.schemas";
import { generateJuryToken } from "@vimmer/api/utils/generate-jury-token";

export const juryRouter = createTRPCRouter({
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
      const invitation = await getJuryInvitationByIdQuery(ctx.db, input);
      return invitation;
    }),

  createJuryInvitation: publicProcedure
    .input(createJuryInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { data } = input;

      // Validate invite type logic
      const hasTopicId = data.topicId !== null && data.topicId !== undefined;
      const hasCompetitionClassId =
        data.competitionClassId !== null &&
        data.competitionClassId !== undefined;

      if (hasTopicId && hasCompetitionClassId) {
        throw new Error(
          "Cannot create invitation with both topic and competition class. Choose either topic invite or class invite.",
        );
      }

      if (!hasTopicId && !hasCompetitionClassId) {
        throw new Error(
          "Must specify either topicId for topic invite or competitionClassId for class invite.",
        );
      }

      // For topic invites: ensure competition_class_id and device_group_id are null
      if (hasTopicId) {
        if (
          data.competitionClassId !== null &&
          data.competitionClassId !== undefined
        ) {
          throw new Error(
            "Topic invites cannot have competition class specified.",
          );
        }
        if (data.deviceGroupId !== null && data.deviceGroupId !== undefined) {
          throw new Error("Topic invites cannot have device group specified.");
        }
      }

      // For class invites: ensure topic_id is null
      if (hasCompetitionClassId) {
        if (data.topicId !== null && data.topicId !== undefined) {
          throw new Error("Class invites cannot have topic specified.");
        }
        // deviceGroupId is optional for class invites, so no validation needed
      }

      const id = await createJuryInvitationMutation(ctx.db, {
        data,
      });
      const token = await generateJuryToken(data.domain, id);
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

  verifyTokenAndGetInitialData: publicProcedure
    .input(verifyJuryTokenSchema)
    .query(async ({ ctx, input }) => {
      return verifyJuryTokenAndGetDataQuery(ctx.db, {
        token: input.token,
      });
    }),

  getJurySubmissionsFromToken: publicProcedure
    .input(getJurySubmissionsFromTokenSchema)
    .query(async ({ ctx, input }) => {
      return getJurySubmissionsFromTokenQuery(ctx.db, {
        token: input.token,
        cursor: input.cursor,
        ratingFilter: input.ratingFilter,
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
        finalRanking: input.finalRanking,
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

  getJuryRatingsByInvitation: publicProcedure
    .input(getJuryRatingsByInvitationSchema)
    .query(async ({ ctx, input }) => {
      return getJuryRatingsByInvitationQuery(ctx.db, {
        token: input.token,
      });
    }),

  getJuryParticipantCount: publicProcedure
    .input(getJuryParticipantCountSchema)
    .query(async ({ ctx, input }) => {
      return getJuryParticipantCountQuery(ctx.db, {
        token: input.token,
        ratingFilter: input.ratingFilter,
      });
    }),
});
