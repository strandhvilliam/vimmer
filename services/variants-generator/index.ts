import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Resource } from "sst";
import sharp from "sharp";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { AppRouter } from "@vimmer/api/trpc/routers/_app";
import superjson from "superjson";
import { z } from "zod/v4";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const createApiClient = () =>
  createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      httpBatchLink({
        url: Resource.Api.url + "trpc",
        transformer: superjson,
      }),
    ],
  });

const varantsInputSchema = z.object({
  submissionIds: z.array(z.number()),
});

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    if (!event.body) throw new Error("No request body");
    const parsedBody = varantsInputSchema.safeParse(JSON.parse(event.body));
    if (!parsedBody.success) {
      console.log("Invalid request body", parsedBody.error);
      throw new Error("Invalid request body");
    }

    const { submissionIds } = parsedBody.data;

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      throw new Error("submissionIds array is required");
    }

    const s3Client = new S3Client({ region: "eu-north-1" });
    const apiClient = createApiClient();
    const results = [];

    for (const submissionId of submissionIds) {
      try {
        // Get submission from database
        const submission = await apiClient.submissions.getById.query({
          id: submissionId,
        });

        if (!submission || !submission.key) {
          results.push({
            submissionId,
            success: false,
            error: "Submission not found or missing key",
          });
          continue;
        }

        // Skip if thumbnails already exist
        if (submission.thumbnailKey && submission.previewKey) {
          results.push({
            submissionId,
            success: true,
            message: "Thumbnails already exist",
          });
          continue;
        }

        // Get original image from S3
        const fileData = await getFileFromS3(
          s3Client,
          submission.key,
          Resource.SubmissionBucket.name,
        );

        if (!fileData) {
          results.push({
            submissionId,
            success: false,
            error: "Failed to fetch original image from S3",
          });
          continue;
        }

        // Generate thumbnails and previews
        const { thumbnailKey, previewKey } = await generateImageVariants(
          submission.key,
          fileData.file,
          s3Client,
          Resource.ThumbnailBucket.name,
          Resource.PreviewBucket.name,
        );

        if (!fileData) {
          results.push({
            submissionId,
            success: false,
            error: "Failed to fetch original image from S3",
          });
          continue;
        }

        // Generate thumbnails and previews
        const variants = await generateImageVariants(
          submission.key,
          fileData.file,
          s3Client,
          Resource.ThumbnailBucket.name,
          Resource.PreviewBucket.name,
        );

        // Update submission with new keys
        await apiClient.submissions.updateById.mutate({
          id: submissionId,
          data: {
            thumbnailKey: variants.thumbnailKey,
            previewKey: variants.previewKey,
          },
        });

        results.push({
          submissionId,
          success: true,
          thumbnailKey: variants.thumbnailKey,
          previewKey: variants.previewKey,
        });

        results.push({
          submissionId,
          success: true,
          thumbnailKey,
          previewKey,
        });
      } catch (error) {
        console.error(
          `Failed to generate thumbnails for submission ${submissionId}:`,
          error,
        );
        results.push({
          submissionId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return {
      results,
      summary: {
        total: submissionIds.length,
        successful: successCount,
        failed: errorCount,
      },
    };
  } catch (error) {
    console.error("Error in generate-thumbnails API:", error);
    throw new Error("Internal server error");
  }
}

async function getFileFromS3(s3: S3Client, key: string, bucket: string) {
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

async function generateImageVariants(
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

async function createVariant(
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

const IMAGE_VARIANTS = {
  thumbnail: { width: 200, prefix: "thumbnail" },
  preview: { width: 800, prefix: "preview" },
} as const;

function parseKey(key: string) {
  const [domain, participantRef, orderIndex, fileName] = key.split("/");
  if (!domain || !participantRef || !orderIndex || !fileName) {
    throw new Error("Invalid key format");
  }
  return { domain, participantRef, orderIndex, fileName };
}
