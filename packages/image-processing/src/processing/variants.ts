import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { IMAGE_VARIANTS } from "../constants";
import { parseKey } from "../s3/operations";

export async function generateImageVariants(
  originalKey: string,
  file: Uint8Array,
  s3Client: S3Client,
  thumbnailBucket: string,
  previewBucket: string,
) {
  const photoInstance = sharp(file);
  const [thumbnailKey, previewKey] = await Promise.all([
    createVariant(
      originalKey,
      photoInstance,
      IMAGE_VARIANTS.thumbnail,
      s3Client,
      thumbnailBucket,
    ),
    createVariant(
      originalKey,
      photoInstance,
      IMAGE_VARIANTS.preview,
      s3Client,
      previewBucket,
    ),
  ]);

  if (!thumbnailKey || !previewKey) {
    throw new Error("Image variant creation failed");
  }
  return { thumbnailKey, previewKey };
}

export async function createVariant(
  originalKey: string,
  photoInstance: sharp.Sharp,
  config: { width: number; prefix: string },
  s3Client: S3Client,
  bucket: string,
): Promise<string | null> {
  const parsedPath = parseKey(originalKey);
  const variantBuffer = await photoInstance
    .clone()
    .rotate()
    .resize(config.width)
    .toBuffer();
  const variantKey = [
    parsedPath.domain,
    parsedPath.participantRef,
    parsedPath.orderIndex,
    `${config.prefix}_${parsedPath.fileName}`,
  ].join("/");

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: variantKey,
      Body: variantBuffer,
    }),
  );

  return variantKey;
}
