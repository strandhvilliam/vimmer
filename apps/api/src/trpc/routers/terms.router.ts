import { createTRPCRouter, publicProcedure } from "..";
import { z } from "zod/v4";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Resource } from "sst";
import { TRPCError } from "@trpc/server";

const getTermsByDomainSchema = z.object({
  domain: z.string(),
});

export const termsRouter = createTRPCRouter({
  getByDomain: publicProcedure
    .input(getTermsByDomainSchema)
    .query(async ({ input }) => {
      const s3 = new S3Client({ region: "eu-north-1" });
      const key = `${input.domain}/terms-and-conditions.txt`;

      try {
        const command = new GetObjectCommand({
          Bucket: Resource.MarathonSettingsBucket.name,
          Key: key,
        });

        const response = await s3.send(command);

        if (!response.Body) {
          return null;
        }

        const content = await response.Body.transformToString();
        return { content };
      } catch (error: any) {
        if (error.name === "NoSuchKey") {
          return null;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch terms and conditions",
        });
      }
    }),
});
