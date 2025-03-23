"use server";

import { S3Client } from "@aws-sdk/client-s3";
// import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Resource } from "sst";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";

const getLogoUploadUrlSchema = z.object({
  domain: z.string(),
});

export const getLogoUploadUrl = actionClient
  .schema(getLogoUploadUrlSchema)
  .action(async ({ parsedInput: { domain } }) => {
    const s3 = new S3Client({ region: "eu-north-1" });
    const key = `${domain}/logo`;

    // const { url, fields } = await createPresignedPost(s3, {
    //   Bucket: Resource.MarathonSettingsBucket.name,
    //   Key: key,
    // });

    // return {
    //   url,
    //   fields,
    //   key,
    // };
  });
