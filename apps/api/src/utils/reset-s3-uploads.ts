import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Resource } from "sst";

export async function resetS3Uploads(
  keys: {
    submissionKey: string;
    thumbnailKey: string | null;
    previewKey: string | null;
  }[],
) {
  const s3Client = new S3Client({ region: "eu-north-1" });

  for (const key of keys) {
    try {
      const promises = [
        deleteObject(
          s3Client,
          key.submissionKey,
          Resource.SubmissionBucket.name,
        ),
      ];

      if (key.thumbnailKey) {
        promises.push(
          deleteObject(
            s3Client,
            key.thumbnailKey,
            Resource.ThumbnailBucket.name,
          ),
        );
      }

      if (key.previewKey) {
        promises.push(
          deleteObject(s3Client, key.previewKey, Resource.PreviewBucket.name),
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error(`Error deleting object ${key.submissionKey}`, error);
    }
  }
}

function deleteObject(s3Client: S3Client, key: string, bucketName: string) {
  return s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
