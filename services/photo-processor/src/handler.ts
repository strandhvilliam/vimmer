import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { S3Event, SQSEvent } from "aws-lambda";
import sharp from "sharp";
import { PostHog } from "posthog-node";

import exifr from "exifr";
import { Resource } from "sst";
import { task } from "sst/aws/task";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { AppRouter } from "@vimmer/api/trpc/routers/_app";
import superjson from "superjson";

const IMAGE_VARIANTS = {
  thumbnail: { width: 200, prefix: "thumbnail" },
  preview: { width: 800, prefix: "preview" },
} as const;

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
});

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

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    const s3Client = new S3Client();
    const apiClient = createApiClient();
    const keys = event.Records.map((r) => JSON.parse(r.body) as S3Event)
      .flatMap((e) =>
        e.Records?.map((r) => decodeURIComponent(r.s3.object.key))
      )
      .filter(Boolean);

    await Promise.all(
      keys.map((key) => processSubmission(key, s3Client, apiClient))
    );
  } catch (error) {
    console.error(error);
    posthog.captureException(error);
  }
};

async function processSubmission(
  key: string,
  s3Client: S3Client,
  apiClient: ReturnType<typeof createApiClient>
) {
  try {
    const { submission, participant } = await prepareSubmission(apiClient, key);

    if (
      participant.status === "verified" ||
      participant.status === "completed"
    ) {
      console.log("Participant is already verified or completed, skipping");
      return;
    }

    if (
      participant.uploadCount >= participant.competitionClass?.numberOfPhotos!
    ) {
      console.log(
        "Participant has already reached the maximum number of uploads, skipping"
      );
      return;
    }

    const { file, size, metadata, mimeType } = await getFileFromS3(
      s3Client,
      key
    );
    const exif = await parseExifData(file);
    const variants = await generateImageVariants(key, file, s3Client);

    await apiClient.submissions.updateByKey.mutate({
      key,
      data: {
        status: "uploaded",
        thumbnailKey: variants.thumbnailKey,
        previewKey: variants.previewKey,
        exif,
        size,
        mimeType,
        metadata,
      },
    });

    const { isComplete } =
      await apiClient.participants.incrementUploadCounter.mutate({
        participantId: submission.participantId,
        totalExpected: participant.competitionClass?.numberOfPhotos!,
      });

    if (isComplete) {
      await Promise.all([
        triggerValidationQueue(submission.participantId),
        triggerZipGenerationTask(
          participant.domain,
          participant.reference,
          "zip_submissions"
        ),
      ]);
    }
  } catch (error) {
    await handleProcessingError(apiClient, key, error);
    throw error;
  }
}

async function parseExifData(file: Uint8Array<ArrayBufferLike>) {
  const exif = await exifr.parse(file);
  if (!exif) {
    throw new Error("No EXIF data");
  }

  const dateFields = [
    "DateTimeOriginal",
    "DateTimeDigitized",
    "CreateDate",
    "ModifyDate",
    "GPSDateTime",
    "GPSDate",
    "DateTime",
  ];

  for (const field of dateFields) {
    if (exif[field] && typeof exif[field] === "object") {
      try {
        exif[field] = exif[field].toISOString();
      } catch (error) {
        console.error("Error converting date field to ISO string:", error);
      }
    }
  }

  return exif;
}

async function prepareSubmission(
  apiClient: ReturnType<typeof createApiClient>,
  key: string
) {
  const { participantRef, domain } = parseKey(key);
  const { id: submissionId } = await apiClient.submissions.updateByKey.mutate({
    key,
    data: {
      status: "processing",
    },
  });

  if (!submissionId) {
    throw new Error("Submission mutation failed");
  }

  const participant = await apiClient.participants.getByReference.query({
    reference: participantRef,
    domain,
  });

  if (!participant) {
    throw new Error("Unable to find participant");
  }

  const submission = participant.submissions.find((s) => s.key === key);

  if (!submission) {
    throw new Error("Unable to find submission");
  }

  return { submission, participant };
}

async function triggerZipGenerationTask(
  domain: string,
  participantReference: string,
  exportType: "zip_submissions" | "zip_thumbnails" | "zip_previews"
) {
  try {
    await task.run(Resource.GenerateParticipantZipTask, {
      PARTICIPANT_REFERENCE: participantReference,
      DOMAIN: domain,
      EXPORT_TYPE: exportType,
    });
  } catch (error) {
    console.error("Error triggering zip generation task:", error);
  }
}

async function triggerValidationQueue(participantId: number) {
  const sqs = new SQSClient();
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: Resource.ValidateSubmissionQueue.url,
      MessageBody: JSON.stringify({
        participantId,
      }),
    })
  );
}

async function handleProcessingError(
  apiClient: ReturnType<typeof createApiClient>,
  key: string,
  error: unknown
) {
  await Promise.all([
    apiClient.submissions.updateByKey.mutate({
      key,
      data: {
        status: "error",
      },
    }),
  ]);
  console.error(error);
}

async function getFileFromS3(s3: S3Client, key: string) {
  const {
    Body: body,
    ContentType: mimeType,
    ContentLength: size,
    Metadata: metadata,
  } = await s3.send(
    new GetObjectCommand({
      Bucket: Resource.SubmissionBucket.name,
      Key: key,
    })
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

function parseKey(key: string) {
  const [domain, participantRef, orderIndex, fileName] = key.split("/");
  if (!domain || !participantRef || !orderIndex || !fileName) {
    throw new Error("Invalid key format");
  }
  return { domain, participantRef, orderIndex, fileName };
}

async function generateImageVariants(
  originalKey: string,
  file: Uint8Array,
  s3: S3Client
) {
  const photoInstance = sharp(file);
  const [thumbnailKey, previewKey] = await Promise.all([
    createVariant(originalKey, photoInstance, IMAGE_VARIANTS.thumbnail, s3),
    createVariant(originalKey, photoInstance, IMAGE_VARIANTS.preview, s3),
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
  s3: S3Client
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

  const bucket =
    config.prefix === "thumbnail"
      ? Resource.ThumbnailBucket.name
      : Resource.PreviewBucket.name;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: variantKey,
      Body: variantBuffer,
    })
  );

  return variantKey;
}
