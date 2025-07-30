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
import { db } from "@vimmer/api/db";
import { getParticipantByReferenceQuery } from "@vimmer/api/db/queries/participants.queries";
import { updateSubmissionByKeyMutation } from "@vimmer/api/db/queries/submissions.queries";
import { incrementUploadCounterMutation } from "@vimmer/api/db/queries/participants.queries";
import { createClient } from "@vimmer/supabase/lambda";
import { Participant, Submission } from "@vimmer/api/db/types";

const IMAGE_VARIANTS = {
  thumbnail: { width: 200, prefix: "thumbnail" },
  preview: { width: 800, prefix: "preview" },
} as const;

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
});

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    const s3Client = new S3Client();
    const keys = event.Records.map((r) => JSON.parse(r.body) as S3Event)
      .flatMap((e) =>
        e.Records?.map((r) => decodeURIComponent(r.s3.object.key)),
      )
      .filter(Boolean);

    await Promise.all(keys.map((key) => processSubmission(key, s3Client)));
  } catch (error) {
    console.error(error);
    posthog.captureException(error);
  }
};

async function processSubmission(key: string, s3Client: S3Client) {
  try {
    const { participantRef, domain } = parseKey(key);
    const participant = await getParticipantByReferenceQuery(db, {
      reference: participantRef,
      domain,
    });

    if (!participant) {
      console.error("Participant not found");
      return;
    }

    if (
      participant.status === "verified" ||
      participant.status === "completed"
    ) {
      console.log("Participant is already verified or completed, skipping");
      return;
    }

    const { submission } = await prepareSubmission(participant, key);

    if (
      participant.uploadCount >= participant.competitionClass?.numberOfPhotos!
    ) {
      console.log(
        "Participant has already reached the maximum number of uploads, skipping",
      );
      return;
    }

    const { file, size, metadata, mimeType } = await getFileFromS3(
      s3Client,
      key,
    );

    const exif = await parseExifData(file);
    const variants = await generateImageVariants(key, file, s3Client);

    await updateSubmissionByKeyMutation(db, {
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

    const supabase = await createClient();
    const { isComplete } = await incrementUploadCounterMutation(supabase, {
      participantId: submission.participantId,
      totalExpected: participant.competitionClass?.numberOfPhotos!,
    });

    if (isComplete) {
      await Promise.allSettled([
        triggerValidationQueue(submission.participantId),
        triggerZipGenerationTask(
          participant.domain,
          participant.reference,
          "zip_submissions",
        ),
        triggerContactSheetGenerationQueue(
          participant.reference,
          participant.domain,
        ),
      ]);
    }
  } catch (error) {
    await handleProcessingError(key, error);
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
  participant: Participant & { submissions: Submission[] },
  key: string,
) {
  const { id: submissionId } = await updateSubmissionByKeyMutation(db, {
    key,
    data: {
      status: "processing",
    },
  });

  if (!submissionId) {
    throw new Error("Submission mutation failed");
  }

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
  exportType: "zip_submissions" | "zip_thumbnails" | "zip_previews",
) {
  try {
    await task.run(Resource.GenerateParticipantZipTask, {
      PARTICIPANT_REFERENCE: participantReference,
      DOMAIN: domain,
      EXPORT_TYPE: exportType,
    });
    console.log("Zip generation task triggered with params", {
      domain,
      participantReference,
      exportType,
    });
  } catch (error) {
    console.error("Error triggering zip generation task:", error);
  }
}

async function triggerValidationQueue(participantId: number) {
  const sqs = new SQSClient({ region: "eu-north-1" });
  const result = await sqs.send(
    new SendMessageCommand({
      QueueUrl: Resource.ValidateSubmissionQueue.url,
      MessageBody: JSON.stringify({
        participantId,
      }),
    }),
  );
  console.log("Validation queue triggered with result", result);
}

async function triggerContactSheetGenerationQueue(
  participantRef: string,
  domain: string,
) {
  const sqs = new SQSClient({ region: "eu-north-1" });
  const result = await sqs.send(
    new SendMessageCommand({
      QueueUrl: Resource.ContactSheetGeneratorQueue.url,
      MessageBody: JSON.stringify({
        participantRef,
        domain,
      }),
    }),
  );
  console.log("Contact sheet generator queue triggered with result", result);
}

async function handleProcessingError(key: string, error: unknown) {
  await updateSubmissionByKeyMutation(db, {
    key,
    data: {
      status: "error",
    },
  });
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
  s3: S3Client,
) {
  const photoInstance = sharp(file);
  const [thumbnailKey, previewKey] = await Promise.all([
    createVariant(originalKey, photoInstance, IMAGE_VARIANTS.thumbnail, s3),
    createVariant(originalKey, photoInstance, IMAGE_VARIANTS.preview, s3),
  ]);

  return { thumbnailKey, previewKey };
}

async function createVariant(
  originalKey: string,
  photoInstance: sharp.Sharp,
  config: { width: number; prefix: string },
  s3: S3Client,
): Promise<string | undefined> {
  try {
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
      }),
    );

    return variantKey;
  } catch (error) {
    console.error("Error creating variant:", error);
    posthog.captureException(error);
    // We can generate thumbnail and preview later if fails at this stage
    return undefined;
  }
}
