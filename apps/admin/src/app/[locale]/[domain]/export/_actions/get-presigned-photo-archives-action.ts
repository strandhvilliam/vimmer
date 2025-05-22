"use server";

import { AWS_CONFIG } from "@/lib/constants";
import { actionClient } from "@/lib/safe-action";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { createClient } from "@vimmer/supabase/server";
import {
  getMarathonByDomainQuery,
  getZippedSubmissionsByDomainQuery,
} from "@vimmer/supabase/queries";

const getPresignedPhotoArchivesSchema = z.object({
  marathonId: z.string(),
  domain: z.union([z.string(), z.array(z.string())]),
});

type GetPresignedPhotoArchivesInput = z.infer<
  typeof getPresignedPhotoArchivesSchema
>;

export const getPresignedPhotoArchivesAction = actionClient
  .schema(getPresignedPhotoArchivesSchema)
  .action(
    async ({
      parsedInput: { marathonId, domain },
    }): Promise<{ presignedUrls: string[] }> => {
      // Support domain as string or array
      const domainStr = Array.isArray(domain) ? domain[0] : domain;
      if (!domainStr) {
        return { presignedUrls: [] };
      }
      const supabase = await createClient();
      const marathon = await getMarathonByDomainQuery(supabase, domainStr);
      if (!marathon || String(marathon.id) !== marathonId) {
        return { presignedUrls: [] };
      }
      const zippedSubmissions = await getZippedSubmissionsByDomainQuery(
        supabase,
        marathon.id
      );
      const exportsBucket = AWS_CONFIG.buckets.exports;
      const s3Client = new S3Client();
      const presignedUrlPromises: Promise<string>[] = [];
      for (const zippedSubmission of zippedSubmissions) {
        if (!zippedSubmission.zipKey) continue;
        const command = new GetObjectCommand({
          Bucket: exportsBucket,
          Key: zippedSubmission.zipKey,
        });
        presignedUrlPromises.push(
          getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 })
        );
      }
      const presignedUrls = await Promise.all(presignedUrlPromises);
      return { presignedUrls };
    }
  );
