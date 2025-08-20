import { s3Client, HeadObjectCommand } from "../s3";

export interface S3ObjectMetadata {
  exists: boolean;
  size?: number;
  contentType?: string;
  lastModified?: Date;
  isFile: boolean;
}

export async function checkS3ObjectMetadata(
  bucketName: string,
  key: string,
): Promise<S3ObjectMetadata> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    const isFile = Boolean(
      response.ContentLength &&
        response.ContentLength > 0 &&
        response.ContentType &&
        !key.endsWith("/"),
    );

    return {
      exists: true,
      size: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      isFile,
    };
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.name === "NotFound") {
      return {
        exists: false,
        isFile: false,
      };
    }

    console.error("Error checking S3 object metadata:", error);
    throw new Error(`Failed to check S3 object metadata: ${error.message}`);
  }
}

export function validateSubmissionKey(key: string): boolean {
  const keyPattern = /^[^\/]+\/[^\/]+\/\d+\/[^\/]+\.(jpg|jpeg|png|heic|webp)$/i;
  return keyPattern.test(key);
}
