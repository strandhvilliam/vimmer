"use server";
import { actionClient } from "@/lib/actions/safe-action";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resource } from "sst";
import { z } from "zod";

const getTermsUploadUrlSchema = z.object({
  domain: z.string(),
});

export const getTermsUploadAction = actionClient
  .schema(getTermsUploadUrlSchema)
  .action(async ({ parsedInput: { domain } }) => {
    const s3 = new S3Client({ region: "eu-north-1" });
    const key = `${domain}/terms-and-conditions.txt`;
    const command = new PutObjectCommand({
      Bucket: Resource.MarathonSettingsBucket.name,
      Key: key,
      ContentType: "text/plain",
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    return { url, key };
  });
