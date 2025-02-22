"use server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { actionClient } from "./safe-action";
import { createRule, ServerValidator } from "@vimmer/validation/server";
import { Resource } from "sst";

export const demoaction = actionClient.action(async () => {
  const s3 = new S3Client({ region: "eu-north-1" });
  console.log("demo action");
  const img = await s3.send(
    new GetObjectCommand({
      Bucket: Resource.SubmissionBucket.name,
      Key: "dev0/1124/01/1124_01.jpg",
    }),
  );

  const validator = new ServerValidator([
    createRule({
      key: "allowed_file_types",
      level: "error",
      params: { extensions: ["png"], mimeTypes: ["image/png"] },
    }),
    createRule({
      key: "same_device",
      level: "error",
      params: {},
    }),
  ]);

  const buffer = await img.Body?.transformToByteArray();
  if (!buffer) return;

  const originalname = "1111_01.jpg";
  const mimetype = img.ContentType;
  const size = img.ContentLength;

  if (!mimetype) return;
  if (!size) return;

  const validation = await validator.validate([
    {
      buffer: Buffer.from(buffer),
      originalname,
      mimetype,
      size,
    },
  ]);

  console.log(JSON.stringify(validation));
});
