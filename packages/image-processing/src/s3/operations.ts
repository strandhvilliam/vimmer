import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export async function getFileFromS3(s3: S3Client, key: string, bucket: string) {
  const {
    Body: body,
    ContentType: mimeType,
    ContentLength: size,
    Metadata: metadata,
  } = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  const file = await body?.transformToByteArray();
  if (!file) {
    throw new Error("Failed to fetch photo");
  }
  return {
    file,
    mimeType,
    size,
    metadata,
  };
}

export async function uploadFileToS3(
  s3: S3Client,
  key: string,
  file: Buffer | Uint8Array,
  bucket: string,
  mimeType?: string,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    }),
  );

  return key;
}

export function parseKey(key: string) {
  const [domain, participantRef, orderIndex, fileName] = key.split("/");
  if (!domain || !participantRef || !orderIndex || !fileName) {
    throw new Error("Invalid key format");
  }
  return { domain, participantRef, orderIndex, fileName };
}
