"use server";

import { actionClient } from "@/lib/safe-action";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

const getOnboardingLogoUploadUrlSchema = z.object({
  domain: z.string(),
  currentKey: z.string().nullable(),
});

const bucket = "vimmer-development-marathonsettingsbucketbucket-huvkamue";

export const getOnboardingLogoUploadAction = actionClient
  .schema(getOnboardingLogoUploadUrlSchema)
  .action(async ({ parsedInput: { currentKey, domain } }) => {
    const version = currentKey
      ? currentKey.split("?")[1]?.split("=")[1]
      : undefined;

    const newVersion = version ? parseInt(version) + 1 : 1;

    const s3 = new S3Client({ region: "eu-north-1" });
    const key = `${domain}/logo?v=${newVersion}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    return { url, key };
  });
