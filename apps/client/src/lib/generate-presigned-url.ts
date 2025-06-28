import "server-only";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function generatePresignedUrl(
  s3Client: S3Client,
  key: string,
  bucketName: string
) {
  // "use cache";
  // cacheLife("minutes");
  // cacheTag(`presigned-url-${key}`);
  try {
    return await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Key: key,
        Bucket: bucketName,
      })
    );
  } catch (error: unknown) {
    console.error(error);
    throw new Error(`Failed to generate presigned URL for submission ${key}`);
  }
}
