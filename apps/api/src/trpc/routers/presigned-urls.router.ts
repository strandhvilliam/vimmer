import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTRPCRouter, publicProcedure } from "..";
import { generatePresignedUrlsSchema } from "@vimmer/api/schemas/presigned-urls.schemas";
import {
  PresignedSubmissionService,
  generatePresignedUrl,
  formatSubmissionKey,
} from "@vimmer/api/utils/generate-presigned-urls";
import { Resource } from "sst";
import { z } from "zod";
import {
  getZippedSubmissionsByMarathonIdQuery,
  getSubmissionByIdQuery,
} from "@vimmer/api/db/queries/submissions.queries";
import {
  updateParticipantMutation,
  getParticipantsByDomainQuery,
  getParticipantByReferenceQuery,
} from "@vimmer/api/db/queries/participants.queries";
import { getMarathonByIdQuery } from "@vimmer/api/db/queries/marathons.queries";

export const presignedUrlsRouter = createTRPCRouter({
  generatePresignedSubmissions: publicProcedure
    .input(generatePresignedUrlsSchema)
    .query(async ({ ctx, input }) => {
      const s3 = new S3Client({ region: "eu-north-1" });
      const bucketName = Resource.SubmissionBucket.name;
      const service = new PresignedSubmissionService(ctx.db, s3, bucketName);

      const participant = await getParticipantByReferenceQuery(ctx.db, {
        reference: input.participantRef,
        domain: input.domain,
      });

      if (
        participant?.status !== "verified" &&
        participant?.status !== "completed" &&
        participant?.status !== "processing"
      ) {
        await updateParticipantMutation(ctx.db, {
          id: input.participantId,
          data: {
            uploadCount: 0,
          },
        });
      }

      return service.generatePresignedSubmissions(
        input.participantRef,
        input.domain,
        input.participantId,
        input.competitionClassId,
        input.preconvertedExifData ?? [],
      );
    }),
  generatePresignedSubmissionsOnDemand: publicProcedure
    .input(generatePresignedUrlsSchema)
    .mutation(async ({ ctx, input }) => {
      const s3 = new S3Client({ region: "eu-north-1" });
      const bucketName = Resource.SubmissionBucket.name;
      const service = new PresignedSubmissionService(ctx.db, s3, bucketName);

      const participant = await getParticipantByReferenceQuery(ctx.db, {
        reference: input.participantRef,
        domain: input.domain,
      });

      if (
        participant?.status !== "verified" &&
        participant?.status !== "completed" &&
        participant?.status !== "processing"
      ) {
        await updateParticipantMutation(ctx.db, {
          id: input.participantId,
          data: {
            uploadCount: 0,
          },
        });
      }

      return service.generatePresignedSubmissions(
        input.participantRef,
        input.domain,
        input.participantId,
        input.competitionClassId,
        input.preconvertedExifData ?? [],
      );
    }),
  generateZipSubmissionsPresignedUrls: publicProcedure
    .input(
      z.object({
        marathonId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const zippedSubmissions = await getZippedSubmissionsByMarathonIdQuery(
        ctx.db,
        { marathonId: input.marathonId },
      );
      const s3Client = new S3Client();
      const presignedUrlPromises: Promise<string>[] = [];
      const failedParticipantIds: number[] = [];
      for (const zippedSubmission of zippedSubmissions) {
        if (!zippedSubmission.zipKey) {
          failedParticipantIds.push(zippedSubmission.participantId);
          continue;
        }
        const command = new GetObjectCommand({
          Bucket: Resource.ExportsBucket.name,
          Key: zippedSubmission.zipKey,
        });
        presignedUrlPromises.push(
          getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 }),
        );
      }
      const presignedUrls = await Promise.all(presignedUrlPromises);
      return { presignedUrls, failedParticipantIds };
    }),
  generateContactSheetPresignedUrls: publicProcedure
    .input(
      z.object({
        marathonId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const marathon = await getMarathonByIdQuery(ctx.db, {
        id: input.marathonId,
      });
      if (!marathon) {
        throw new Error("Marathon not found");
      }

      const participants = await getParticipantsByDomainQuery(ctx.db, {
        domain: marathon.domain,
      });
      const participantsWithContactSheets = participants.filter(
        (p) => p.contactSheetKey,
      );

      const s3Client = new S3Client();
      const contactSheetUrls: { participantRef: string; url: string }[] = [];
      const failedParticipantIds: number[] = [];

      for (const participant of participantsWithContactSheets) {
        if (!participant.contactSheetKey) {
          failedParticipantIds.push(participant.id);
          continue;
        }

        try {
          const command = new GetObjectCommand({
            Bucket: Resource.ContactSheetsBucket.name,
            Key: participant.contactSheetKey,
          });
          const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 60 * 24,
          });
          contactSheetUrls.push({
            participantRef: participant.reference,
            url: presignedUrl,
          });
        } catch (error) {
          console.error(
            `Failed to generate presigned URL for participant ${participant.id}:`,
            error,
          );
          failedParticipantIds.push(participant.id);
        }
      }

      return { contactSheetUrls, failedParticipantIds };
    }),
  generateReplacementPresignedUrl: publicProcedure
    .input(
      z.object({
        submissionId: z.number(),
        domain: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { submissionId, domain } = input;
      const submission = await getSubmissionByIdQuery(ctx.db, {
        id: submissionId,
      });
      if (!submission) {
        throw new Error("Submission not found");
      }

      const keyParts = submission.key.split("/");
      const participantRef = keyParts[1];
      const orderIndex = keyParts[2];

      if (!participantRef || !orderIndex) {
        throw new Error("Invalid submission key format");
      }

      const newKey = formatSubmissionKey({
        domain,
        ref: participantRef,
        index: parseInt(orderIndex) - 1, // formatSubmissionKey expects 0-based index
      });

      const keyParts2 = newKey.split("/");
      const fileName = keyParts2[3];
      const thumbnailKey = [
        keyParts2[0],
        keyParts2[1],
        keyParts2[2],
        `thumbnail_${fileName}`,
      ].join("/");
      const previewKey = [
        keyParts2[0],
        keyParts2[1],
        keyParts2[2],
        `preview_${fileName}`,
      ].join("/");

      // Generate presigned URLs for all three versions
      const s3Client = new S3Client();
      const [originalPresignedUrl, thumbnailPresignedUrl, previewPresignedUrl] =
        await Promise.all([
          generatePresignedUrl(
            s3Client,
            newKey,
            Resource.SubmissionBucket.name,
          ),
          generatePresignedUrl(
            s3Client,
            thumbnailKey,
            Resource.ThumbnailBucket.name,
          ),
          generatePresignedUrl(
            s3Client,
            previewKey,
            Resource.PreviewBucket.name,
          ),
        ]);

      return {
        original: {
          presignedUrl: originalPresignedUrl,
          key: newKey,
        },
        thumbnail: {
          presignedUrl: thumbnailPresignedUrl,
          key: thumbnailKey,
          width: 200,
        },
        preview: {
          presignedUrl: previewPresignedUrl,
          key: previewKey,
          width: 800,
        },
      };
    }),
});
