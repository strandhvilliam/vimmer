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
  getSubmissionByKeyQuery,
  getZippedSubmissionByParticipantRefQuery,
  getAllSubmissionKeysForMarathonQuery,
  getZippedSubmissionsByDomainQuery,
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
  verifyS3UploadSchema,
} from "@vimmer/api/schemas/submissions.schemas";
import { z } from "zod/v4";
import { S3Client } from "@aws-sdk/client-s3";
import { Resource } from "sst";
import {
  checkS3ObjectMetadata,
  validateSubmissionKey,
} from "@vimmer/api/utils/s3-metadata-checker";
import { TRPCError } from "@trpc/server";

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
      return getZippedSubmissionsByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),

  getZippedSubmissionsByParticipantRef: publicProcedure
    .input(getZippedSubmissionsByParticipantRefSchema)
    .query(async ({ ctx, input }) => {
      return getZippedSubmissionByParticipantRefQuery(ctx.db, {
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

  updateMultipleByIds: publicProcedure
    .input(z.array(updateSubmissionByIdSchema))
    .mutation(async ({ ctx, input }) => {
      for (const item of input) {
        await updateSubmissionByIdMutation(ctx.db, {
          id: item.id,
          data: item.data,
        });
      }
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

  verifyS3Upload: publicProcedure
    .input(verifyS3UploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { key } = input;
      console.log("verifyS3Upload", key);

      if (!validateSubmissionKey(key)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid submission key format",
        });
      }

      const submission = await getSubmissionByKeyQuery(ctx.db, { key });
      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found for the provided key",
        });
      }

      const s3Client = new S3Client({ region: "eu-north-1" });
      const bucketName = Resource.SubmissionBucket.name;

      const metadata = await checkS3ObjectMetadata(s3Client, bucketName, key);

      if (!metadata.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found in S3 bucket",
        });
      }

      if (!metadata.isFile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "S3 object is not a valid file",
        });
      }

      await updateSubmissionByKeyMutation(ctx.db, {
        key,
        data: {
          status: "uploaded",
          size: metadata.size,
          mimeType: metadata.contentType,
        },
      });

      return {
        success: true,
        key,
        status: "uploaded",
        size: metadata.size,
        contentType: metadata.contentType,
        lastModified: metadata.lastModified,
      };
    }),
});
