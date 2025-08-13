import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import { fileTypeFromBuffer } from "file-type"
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { S3Event, SQSEvent } from "aws-lambda"
import sharp from "sharp"
import { PostHog } from "posthog-node"

import exifr from "exifr"
import { Resource } from "sst"
import { task } from "sst/aws/task"
import { db } from "@vimmer/api/db"
import { getParticipantByReferenceQuery } from "@vimmer/api/db/queries/participants.queries"
import { updateSubmissionByKeyMutation } from "@vimmer/api/db/queries/submissions.queries"
import { incrementUploadCounterMutation } from "@vimmer/api/db/queries/participants.queries"
import { createClient } from "@vimmer/supabase/lambda"
import { Participant, Submission } from "@vimmer/api/db/types"
import heicConvert from "heic-convert"

const IMAGE_VARIANTS = {
  thumbnail: { width: 200, prefix: "thumbnail" },
  preview: { width: 800, prefix: "preview" },
} as const

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
})

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    const s3Client = new S3Client()
    const keys = event.Records.map((r) => JSON.parse(r.body) as S3Event)
      .flatMap((e) =>
        e.Records?.map((r) => decodeURIComponent(r.s3.object.key))
      )
      .filter(Boolean)

    await Promise.all(keys.map((key) => processSubmission(key, s3Client)))
  } catch (error) {
    console.error(error)
    posthog.captureException(error)
  }
}

function isValidImageSize(metadata: sharp.Metadata) {
  return metadata.width <= 3840 && metadata.height <= 2160
}

async function resizeToMaximumSize(
  s3Client: S3Client,
  key: string,
  sharpInstance: sharp.Sharp
) {
  const resizedImage = sharpInstance
    .resize(3840, 2160, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .keepMetadata()

  const buffer = await resizedImage.toBuffer()

  await s3Client.send(
    new PutObjectCommand({
      Bucket: Resource.SubmissionBucket.name,
      Key: key,
      Body: buffer,
      Metadata: {
        isresized: "true",
      },
    })
  )
}

async function processSubmission(key: string, s3Client: S3Client) {
  try {
    const { participantRef, domain } = parseKey(key)
    const participant = await getParticipantByReferenceQuery(db, {
      reference: participantRef,
      domain,
    })

    if (!participant) {
      console.error("Participant not found", key)
      return
    }

    if (
      participant.status === "verified" ||
      participant.status === "completed"
    ) {
      console.log("Participant is already verified or completed, skipping", key)
      return
    }

    if (
      participant.uploadCount >= participant.competitionClass?.numberOfPhotos!
    ) {
      console.log(
        "Participant has already reached the maximum number of uploads, skipping",
        key
      )
      return
    }

    const { file, size, mimeType, s3Metadata } = await getFileFromS3(
      s3Client,
      key
    )

    const fileBuffer = file

    if (s3Metadata?.isresized === "true") {
      console.log("File already resized, skipping", key)
      return
    }

    if (
      participant.submissions.find((s) => s.key === key)?.status ===
      "processing"
    ) {
      console.log("File is already being processed, skipping", key)
      return
    }

    const { submission } = await prepareSubmission(participant, key)
    const exif =
      submission.mimeType === "image/heic"
        ? submission.exif
        : await parseExifData(fileBuffer, submission)
    const sharpInstance = sharp(fileBuffer)

    const [metadata, variants] = await Promise.all([
      parseMetadata(sharpInstance),
      generateImageVariants(key, sharpInstance, s3Client),
    ])

    if (metadata && !isValidImageSize(metadata)) {
      await resizeToMaximumSize(s3Client, key, sharpInstance)
    }

    if (!variants.thumbnailKey) {
      console.log("Generating thumbnail from exif", key)
      try {
        const newThumbnailKey = await generateThumbnailFromExif(
          s3Client,
          fileBuffer,
          key
        )

        if (newThumbnailKey) {
          variants.thumbnailKey = newThumbnailKey
        }
      } catch (error) {
        console.error("Error generating thumbnail from exif", key, error)
        posthog.captureException(error)
      }
    }

    await updateSubmissionByKeyMutation(db, {
      key,
      data: {
        status: "uploaded",
        thumbnailKey: variants.thumbnailKey,
        previewKey: variants.previewKey,
        exif: exif ?? {},
        size,
        mimeType,
        metadata,
      },
    })

    const supabase = await createClient()
    const { isComplete } = await incrementUploadCounterMutation(supabase, {
      participantId: submission.participantId,
      totalExpected: participant.competitionClass?.numberOfPhotos!,
    })

    if (isComplete) {
      console.log(
        `All submissions for participant ${participant.id} are complete. Beginning validation and zip generation.`
      )
      await Promise.allSettled([
        triggerValidationQueue(submission.participantId),
        triggerZipGenerationTask(
          participant.domain,
          participant.reference,
          "zip_submissions"
        ),
        triggerContactSheetGenerationQueue(
          participant.reference,
          participant.domain
        ),
      ])
    }
  } catch (error) {
    await handleProcessingError(key, error)
    throw error
  }
}

async function parseMetadata(sharpInstance: sharp.Sharp) {
  try {
    const metadata = await sharpInstance.metadata()
    delete metadata.xmp // deleting to not save large buffer
    delete metadata.exif // already get exif from parser
    return metadata
  } catch (error) {
    console.error("Error parsing metadata:", error)
    return null
  }
}

async function parseExifData(
  file: Uint8Array<ArrayBufferLike>,
  submission: Submission
) {
  try {
    const exif = await exifr.parse(file)
    if (!exif) {
      console.error(`No EXIF data found for submission ${submission.id}`)
      return null
    }

    const dateFields = [
      "DateTimeOriginal",
      "DateTimeDigitized",
      "CreateDate",
      "ModifyDate",
      "GPSDateTime",
      "GPSDate",
      "DateTime",
    ]

    for (const field of dateFields) {
      if (exif[field] && typeof exif[field] === "object") {
        try {
          exif[field] = exif[field].toISOString()
        } catch (error) {
          console.error("Error converting date field to ISO string:", error)
        }
      }
    }

    return sanitizeExifData(exif)
  } catch (error) {
    console.error(
      `Error parsing EXIF data for submission ${submission.id}:`,
      error
    )
    return null
  }
}

function sanitizeExifData(obj: any, visited = new WeakSet()): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (visited.has(obj)) {
    return "[Circular Reference]"
  }

  if (
    obj instanceof Uint8Array ||
    obj instanceof ArrayBuffer ||
    Buffer.isBuffer(obj)
  ) {
    return `[Binary Data: ${obj.byteLength} bytes]`
  }

  if (typeof obj === "string") {
    return obj.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    visited.add(obj)
    const result = obj.map((item) => sanitizeExifData(item, visited))
    visited.delete(obj)
    return result
  }

  if (typeof obj === "object") {
    visited.add(obj)
    const result: any = {}

    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey =
        typeof key === "string"
          ? key.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          : key
      if (sanitizedKey) {
        result[sanitizedKey] = sanitizeExifData(value, visited)
      }
    }

    visited.delete(obj)
    return result
  }

  return obj
}

async function prepareSubmission(
  participant: Participant & { submissions: Submission[] },
  key: string
) {
  const { id: submissionId } = await updateSubmissionByKeyMutation(db, {
    key,
    data: {
      status: "processing",
    },
  })

  if (!submissionId) {
    throw new Error("Submission mutation failed")
  }

  if (!participant) {
    throw new Error("Unable to find participant")
  }

  const submission = participant.submissions.find((s) => s.key === key)

  if (!submission) {
    throw new Error("Unable to find submission")
  }

  return { submission, participant }
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
    })
    console.log("Zip generation task triggered with params", {
      domain,
      participantReference,
      exportType,
    })
  } catch (error) {
    console.error("Error triggering zip generation task:", error)
  }
}

async function triggerValidationQueue(participantId: number) {
  const sqs = new SQSClient({ region: "eu-north-1" })
  const result = await sqs.send(
    new SendMessageCommand({
      QueueUrl: Resource.ValidateSubmissionQueue.url,
      MessageBody: JSON.stringify({
        participantId,
      }),
    })
  )
  console.log("Validation queue triggered with result", result)
}

async function triggerContactSheetGenerationQueue(
  participantRef: string,
  domain: string
) {
  const sqs = new SQSClient({ region: "eu-north-1" })
  const result = await sqs.send(
    new SendMessageCommand({
      QueueUrl: Resource.ContactSheetGeneratorQueue.url,
      MessageBody: JSON.stringify({
        participantRef,
        domain,
      }),
    })
  )
  console.log("Contact sheet generator queue triggered with result", result)
}

async function handleProcessingError(key: string, error: unknown) {
  await updateSubmissionByKeyMutation(db, {
    key,
    data: {
      status: "error",
    },
  })
  console.error(error)
}

async function getFileFromS3(s3: S3Client, key: string) {
  const {
    Body: body,
    ContentType: mimeType,
    ContentLength: size,
    Metadata: s3Metadata,
  } = await s3.send(
    new GetObjectCommand({
      Bucket: Resource.SubmissionBucket.name,
      Key: key,
    })
  )

  const file = await body?.transformToByteArray()
  if (!file) {
    throw new Error("Failed to fetch photo")
  }
  return {
    file,
    mimeType,
    size,
    s3Metadata,
  }
}

function parseKey(key: string) {
  const [domain, participantRef, orderIndex, fileName] = key.split("/")
  if (!domain || !participantRef || !orderIndex || !fileName) {
    throw new Error("Invalid key format")
  }
  return { domain, participantRef, orderIndex, fileName }
}

async function generateImageVariants(
  originalKey: string,
  sharpInstance: sharp.Sharp,
  s3: S3Client
) {
  const [thumbnailKey, previewKey] = await Promise.all([
    createVariant(originalKey, sharpInstance, IMAGE_VARIANTS.thumbnail, s3),
    createVariant(originalKey, sharpInstance, IMAGE_VARIANTS.preview, s3),
  ])

  return { thumbnailKey, previewKey }
}

async function createVariant(
  originalKey: string,
  photoInstance: sharp.Sharp,
  config: { width: number; prefix: string },
  s3: S3Client
): Promise<string | undefined> {
  try {
    const variantBuffer = await photoInstance
      .clone()
      .rotate()
      .resize(config.width)
      .toBuffer()
    const variantKey = generateVariantKey(originalKey, config)
    const bucket =
      config.prefix === "thumbnail"
        ? Resource.ThumbnailBucket.name
        : Resource.PreviewBucket.name

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: variantKey,
        Body: variantBuffer,
      })
    )

    return variantKey
  } catch (error) {
    console.error("Error creating variant:", error)
    posthog.captureException(error)
    // We can generate thumbnail and preview later if fails at this stage
    return undefined
  }
}

function generateVariantKey(
  originalKey: string,
  config: { width: number; prefix: string }
) {
  const parsedPath = parseKey(originalKey)
  return [
    parsedPath.domain,
    parsedPath.participantRef,
    parsedPath.orderIndex,
    `${config.prefix}_${parsedPath.fileName}`,
  ].join("/")
}

async function generateThumbnailFromExif(
  s3: S3Client,
  file: Uint8Array<ArrayBufferLike>,
  originalKey: string
): Promise<string | undefined> {
  try {
    const thumbnailKey = generateVariantKey(originalKey, {
      width: IMAGE_VARIANTS.thumbnail.width,
      prefix: IMAGE_VARIANTS.thumbnail.prefix,
    })
    const thumbnailBuffer = await exifr.thumbnail(file)
    if (thumbnailBuffer) {
      await s3.send(
        new PutObjectCommand({
          Bucket: Resource.ThumbnailBucket.name,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
        })
      )
    }
    return thumbnailKey
  } catch (error) {
    console.error("Error generating thumbnail from exif", originalKey, error)
    posthog.captureException(error)
    return undefined
  }
}

// async function convertHeicToJpg(
//   s3Client: S3Client,
//   key: string,
//   file: Uint8Array<ArrayBufferLike>
// ) {
//   const buffer = new Uint8Array(file.buffer)

//   const outputBuffer = await heicConvert({
//     buffer: buffer.buffer,
//     format: "JPEG", // output format
//     quality: 1, // the jpeg compression quality, between 0 and 1
//   })

//   await s3Client.send(
//     new PutObjectCommand({
//       Bucket: Resource.SubmissionBucket.name,
//       Key: key,
//       Body: new Uint8Array(outputBuffer),
//       ContentType: "image/jpeg",
//       Metadata: {
//         isresized: "true",
//       },
//     })
//   )
//   return buffer
// }
