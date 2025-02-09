import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createClient } from "@vimmer/supabase/lambda";
import { S3Event, SQSEvent } from "aws-lambda";
import sharp from "sharp";

import {
  addMultipleSubmissionErrors,
  updateSubmissionById,
  updateSubmissionByKey,
} from "@vimmer/supabase/mutations";
import { SupabaseClient } from "@vimmer/supabase/types";
import { ErrorCode, SubmissionProcessingError } from "@vimmer/utils/errors";
import exifr from "exifr";
import { Resource } from "sst";

const IMAGE_VARIANTS = {
  thumbnail: { width: 200, prefix: "thumbnail" },
  preview: { width: 800, prefix: "preview" },
} as const;

export const handler = async (event: SQSEvent): Promise<void> => {
  const s3 = new S3Client();
  const supabase = await createClient();
  const keys = event.Records.map((r) => JSON.parse(r.body) as S3Event)
    .flatMap((e) => e.Records?.map((r) => decodeURIComponent(r.s3.object.key)))
    .filter(Boolean);

  await Promise.all(keys.map((key) => processSubmission(key, s3, supabase)));
};

async function processSubmission(
  key: string,
  s3: S3Client,
  supabase: SupabaseClient,
) {
  try {
    const submission = await updateSubmissionByKey(supabase, key, {
      status: "processing",
    });

    if (!submission) {
      throw new SubmissionProcessingError([
        ErrorCode.SUBMISSION_MUTATION_FAILED,
      ]);
    }

    const { file, size, metadata, mimeType } = await getFileFromS3(s3, key);
    if (!file) {
      throw new SubmissionProcessingError([ErrorCode.FAILED_TO_FETCH_PHOTO]);
    }
    const exif = await exifr.parse(file);

    if (!exif) {
      throw new SubmissionProcessingError([ErrorCode.NO_EXIF_DATA], {
        exif,
      });
    }

    const variants = await generateImageVariants(key, file, s3);
    if (!variants) {
      throw new SubmissionProcessingError([
        ErrorCode.IMAGE_VARIANT_CREATION_FAILED,
      ]);
    }

    await updateSubmissionById(supabase, submission.id, {
      status: "uploaded",
      thumbnailKey: variants.thumbnailKey,
      previewKey: variants.previewKey,
      exif,
      size,
      mimeType,
      metadata,
    });
  } catch (error) {
    await handleProcessingError(supabase, key, error);
    throw error;
  }
}

async function handleProcessingError(
  supabase: SupabaseClient,
  key: string,
  error: unknown,
) {
  const submissionError =
    error instanceof SubmissionProcessingError
      ? error
      : new SubmissionProcessingError([ErrorCode.UNKNOWN_ERROR], {
          originalError: error,
        });

  if (!submissionError.catalog) {
    console.error("Non saveable error:", submissionError);
    throw submissionError;
  }

  const insertErrors = submissionError.catalog.map((c) => ({
    submissionKey: key,
    errorCode: c.code,
    message: c.message,
    description: c.description,
    severity: c.severity,
    context: submissionError.context
      ? JSON.stringify(submissionError.context)
      : null,
  }));

  await Promise.all([
    addMultipleSubmissionErrors(supabase, insertErrors),
    updateSubmissionByKey(supabase, key, {
      status: "error",
    }),
  ]);
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
    throw new SubmissionProcessingError([ErrorCode.INVALID_KEY_FORMAT], {
      key,
    });
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

  return thumbnailKey && previewKey ? { thumbnailKey, previewKey } : null;
}

async function createVariant(
  originalKey: string,
  photoInstance: sharp.Sharp,
  config: { width: number; prefix: string },
  s3: S3Client,
): Promise<string | null> {
  const parsedPath = parseKey(originalKey);
  console.log({ parsedPath });
  const variantBuffer = await photoInstance
    .clone()
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
}
