import {
  getZippedSubmissionsByMarathonIdQuery,
  getManySubmissionsByKeysQuery,
  getSubmissionsForJuryQuery,
  createSubmissionMutation,
  createMultipleSubmissionsMutation,
  updateSubmissionByKeyMutation,
  updateSubmissionByIdMutation,
  createZippedSubmissionMutation,
  updateZippedSubmissionMutation,
  getSubmissionsByParticipantIdQuery,
  getSubmissionByIdQuery,
  getZippedSubmissionsByParticipantRefQuery,
  getAllSubmissionKeysForMarathonQuery,
} from "@vimmer/api/db/queries/submissions.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  getZippedSubmissionsByDomainSchema,
  getManySubmissionsByKeysSchema,
  getSubmissionsForJurySchema,
  createSubmissionSchema,
  createMultipleSubmissionsSchema,
  updateSubmissionByKeySchema,
  updateSubmissionByIdSchema,
  createZippedSubmissionSchema,
  updateZippedSubmissionSchema,
  getSubmissionsByParticipantIdSchema,
  getSubmissionByIdSchema,
  getZippedSubmissionsByParticipantRefSchema,
} from "@vimmer/api/schemas/submissions.schemas";
import { z } from "zod";

export const submissionsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(getSubmissionByIdSchema)
    .query(async ({ ctx, input }) => {
      return getSubmissionByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getZippedSubmissionsByDomain: publicProcedure
    .input(getZippedSubmissionsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getZippedSubmissionsByMarathonIdQuery(ctx.db, {
        marathonId: input.marathonId,
      });
    }),

  getZippedSubmissionsByParticipantRef: publicProcedure
    .input(getZippedSubmissionsByParticipantRefSchema)
    .query(async ({ ctx, input }) => {
      return getZippedSubmissionsByParticipantRefQuery(ctx.db, {
        domain: input.domain,
        participantRef: input.participantRef,
      });
    }),

  getByKeys: publicProcedure
    .input(getManySubmissionsByKeysSchema)
    .query(async ({ ctx, input }) => {
      return getManySubmissionsByKeysQuery(ctx.db, {
        keys: input.keys,
      });
    }),

  getByParticipantId: publicProcedure
    .input(getSubmissionsByParticipantIdSchema)
    .query(async ({ ctx, input }) => {
      return getSubmissionsByParticipantIdQuery(ctx.db, {
        participantId: input.participantId,
      });
    }),

  getForJury: publicProcedure
    .input(getSubmissionsForJurySchema)
    .query(async ({ ctx, input }) => {
      return getSubmissionsForJuryQuery(ctx.db, {
        domain: input.domain,
        competitionClassId: input.competitionClassId,
        deviceGroupId: input.deviceGroupId,
        topicId: input.topicId,
      });
    }),

  getAllSubmissionKeysForMarathon: publicProcedure
    .input(
      z.object({
        marathonId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getAllSubmissionKeysForMarathonQuery(ctx.db, {
        marathonId: input.marathonId,
      });
    }),

  create: publicProcedure
    .input(createSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      return createSubmissionMutation(ctx.db, {
        data: input.data,
      });
    }),

  createMultiple: publicProcedure
    .input(createMultipleSubmissionsSchema)
    .mutation(async ({ ctx, input }) => {
      return createMultipleSubmissionsMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateByKey: publicProcedure
    .input(updateSubmissionByKeySchema)
    .mutation(async ({ ctx, input }) => {
      return updateSubmissionByKeyMutation(ctx.db, {
        key: input.key,
        data: input.data,
      });
    }),

  updateById: publicProcedure
    .input(updateSubmissionByIdSchema)
    .mutation(async ({ ctx, input }) => {
      return updateSubmissionByIdMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  createZipped: publicProcedure
    .input(createZippedSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      return createZippedSubmissionMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateZipped: publicProcedure
    .input(updateZippedSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      return updateZippedSubmissionMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  replacePhoto: publicProcedure
    .input(
      z.object({
        submissionId: z.number(),
        originalKey: z.string(),
        thumbnailKey: z.string(),
        previewKey: z.string(),
        mimeType: z.string(),
        size: z.number(),
        exif: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        submissionId,
        originalKey,
        thumbnailKey,
        previewKey,
        mimeType,
        size,
        exif,
      } = input;

      const submission = await getSubmissionByIdQuery(ctx.db, {
        id: submissionId,
      });
      if (!submission) {
        throw new Error("Submission not found");
      }

      await updateSubmissionByIdMutation(ctx.db, {
        id: submissionId,
        data: {
          key: originalKey,
          thumbnailKey,
          previewKey,
          status: "uploaded",
          mimeType,
          size,
          exif,
        },
      });

      return {
        success: true,
        originalKey,
        thumbnailKey,
        previewKey,
        status: "uploaded",
      };
    }),
});
