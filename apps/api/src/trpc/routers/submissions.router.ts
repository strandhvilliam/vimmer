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
import { S3Client } from "@aws-sdk/client-s3";
import { Resource } from "sst";
import { z } from "zod";
import {
  parseExifData,
  generateImageVariants,
  uploadFileToS3,
  parseKey,
} from "@vimmer/image-processing";
import { formatSubmissionKey } from "@vimmer/api/utils/generate-presigned-urls";

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
        newFileBuffer: z.instanceof(ArrayBuffer),
        fileName: z.string(),
        mimeType: z.string(),
        size: z.number(),
        domain: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { submissionId, newFileBuffer, mimeType, size, domain } = input;

      // 1. Get current submission
      const submission = await getSubmissionByIdQuery(ctx.db, {
        id: submissionId,
      });
      if (!submission) {
        throw new Error("Submission not found");
      }

      // 2. Extract current version and increment
      const currentKey = submission.key!; // Non-null assertion since key is NOT NULL in DB
      const versionMatch = currentKey.match(/_v(\d+)\.jpg$/);
      const currentVersion =
        versionMatch && versionMatch[1] ? parseInt(versionMatch[1]) : 1;
      const newVersion = currentVersion + 1;

      // 3. Parse current key to get participant info
      const parsedKey = parseKey(currentKey);
      const { participantRef, orderIndex } = parsedKey;

      // 4. Generate new key with incremented version
      const newKey = formatSubmissionKey({
        domain,
        ref: participantRef,
        index: parseInt(orderIndex) - 1, // formatSubmissionKey expects 0-based index
        version: newVersion,
      });

      // 5. Upload original file to S3
      const s3Client = new S3Client();
      await uploadFileToS3(
        s3Client,
        newKey,
        new Uint8Array(newFileBuffer),
        Resource.SubmissionBucket.name,
        mimeType,
      );

      // 6. Extract EXIF data
      const fileBuffer = new Uint8Array(newFileBuffer);
      const exifData = await parseExifData(fileBuffer);

      // 7. Generate thumbnails and previews
      const { thumbnailKey, previewKey } = await generateImageVariants(
        newKey,
        fileBuffer,
        s3Client,
        Resource.ThumbnailBucket.name,
        Resource.PreviewBucket.name,
      );

      // 8. Update database with all new data
      await updateSubmissionByIdMutation(ctx.db, {
        id: submissionId,
        data: {
          key: newKey,
          thumbnailKey,
          previewKey,
          exif: exifData,
          size,
          mimeType,
          status: "uploaded",
        },
      });

      return {
        success: true,
        newKey,
        thumbnailKey,
        previewKey,
        version: newVersion,
      };
    }),
});
