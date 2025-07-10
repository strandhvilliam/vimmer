import { S3Client } from "@aws-sdk/client-s3";
import { createTRPCRouter, publicProcedure } from "..";
import { generatePresignedUrlsSchema } from "@vimmer/api/schemas/presigned-urls.schemas";
import { PresignedSubmissionService } from "@vimmer/api/utils/generate-presigned-urls";
import { Resource } from "sst";

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
        input.competitionClassId
      );
    }),
});
