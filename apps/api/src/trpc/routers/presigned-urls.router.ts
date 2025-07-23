import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTRPCRouter, publicProcedure } from "..";
import { generatePresignedUrlsSchema } from "@vimmer/api/schemas/presigned-urls.schemas";
import { PresignedSubmissionService } from "@vimmer/api/utils/generate-presigned-urls";
import { Resource } from "sst";
import { z } from "zod";
import { getZippedSubmissionsByMarathonIdQuery } from "@vimmer/api/db/queries/submissions.queries";

export const presignedUrlsRouter = createTRPCRouter({
  generatePresignedSubmissions: publicProcedure
    .input(generatePresignedUrlsSchema)
    .query(async ({ ctx, input }) => {
      const s3 = new S3Client({ region: "eu-north-1" });
      const bucketName = Resource.SubmissionBucket.name;
      const service = new PresignedSubmissionService(ctx.db, s3, bucketName);

      return service.generatePresignedSubmissions(
        input.participantRef,
        input.domain,
        input.participantId,
        input.competitionClassId,
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
});
