"use server";

import { actionClient } from "@/lib/actions/safe-action";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { createClient } from "@vimmer/supabase/server";
import {
  getMarathonByDomainQuery,
  getZippedSubmissionsByDomainQuery,
} from "@vimmer/supabase/queries";
import { Resource } from "sst";

const getPresignedPhotoArchivesSchema = z.object({
  marathonId: z.string(),
  domain: z.union([z.string(), z.array(z.string())]),
});

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
      const exportsBucket = Resource.ExportsBucket.name;
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

const getPresignedExportUrlSchema = z.object({
  zipKey: z.string(),
});

export const getPresignedExportUrlAction = actionClient
  .schema(getPresignedExportUrlSchema)
  .action(async ({ parsedInput: { zipKey } }) => {
    const exportsBucket = Resource.ExportsBucket.name;
    const s3Client = new S3Client({ region: "eu-north-1" });
    const command = new GetObjectCommand({
      Bucket: exportsBucket,
      Key: zipKey,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 10 });
    return { url };
  });
