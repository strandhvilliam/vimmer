import {
  getZippedSubmissionsByDomainQuery,
  getManySubmissionsByKeysQuery,
  getSubmissionsForJuryQuery,
  createSubmissionMutation,
  createMultipleSubmissionsMutation,
  updateSubmissionByKeyMutation,
  updateSubmissionByIdMutation,
  incrementUploadCounterMutation,
  createZippedSubmissionMutation,
  updateZippedSubmissionMutation,
} from "@/db/queries/submissions.queries";
import { createTRPCRouter, publicProcedure } from "../init";
import {
  getZippedSubmissionsByDomainSchema,
  getManySubmissionsByKeysSchema,
  getSubmissionsForJurySchema,
  createSubmissionSchema,
  createMultipleSubmissionsSchema,
  updateSubmissionByKeySchema,
  updateSubmissionByIdSchema,
  incrementUploadCounterSchema,
  createZippedSubmissionSchema,
  updateZippedSubmissionSchema,
} from "@/schemas/submissions.schemas";

export const submissionsRouter = createTRPCRouter({
  getZippedSubmissionsByDomain: publicProcedure
    .input(getZippedSubmissionsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getZippedSubmissionsByDomainQuery(ctx.db, {
        marathonId: input.marathonId,
      });
    }),

  getManySubmissionsByKeys: publicProcedure
    .input(getManySubmissionsByKeysSchema)
    .query(async ({ ctx, input }) => {
      return getManySubmissionsByKeysQuery(ctx.db, {
        keys: input.keys,
      });
    }),

  getSubmissionsForJury: publicProcedure
    .input(getSubmissionsForJurySchema)
    .query(async ({ ctx, input }) => {
      return getSubmissionsForJuryQuery(ctx.db, {
        domain: input.domain,
        competitionClassId: input.competitionClassId,
        deviceGroupId: input.deviceGroupId,
        topicId: input.topicId,
      });
    }),

  createSubmission: publicProcedure
    .input(createSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      return createSubmissionMutation(ctx.db, {
        data: input.data,
      });
    }),

  createMultipleSubmissions: publicProcedure
    .input(createMultipleSubmissionsSchema)
    .mutation(async ({ ctx, input }) => {
      return createMultipleSubmissionsMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateSubmissionByKey: publicProcedure
    .input(updateSubmissionByKeySchema)
    .mutation(async ({ ctx, input }) => {
      return updateSubmissionByKeyMutation(ctx.db, {
        key: input.key,
        data: input.data,
      });
    }),

  updateSubmissionById: publicProcedure
    .input(updateSubmissionByIdSchema)
    .mutation(async ({ ctx, input }) => {
      return updateSubmissionByIdMutation(ctx.db, {
        id: input.id,
        data: input.data,
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

  createZippedSubmission: publicProcedure
    .input(createZippedSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      return createZippedSubmissionMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateZippedSubmission: publicProcedure
    .input(updateZippedSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      return updateZippedSubmissionMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),
});
