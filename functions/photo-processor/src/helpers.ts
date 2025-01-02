import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { addMultipleSubmissionErrors } from '@vimmer/supabase/mutations'
import { SupabaseClient } from '@vimmer/supabase/types'
import { ErrorCode, SubmissionProcessingError } from '@vimmer/utils/errors'
import exifr from 'exifr'
import sharp from 'sharp'
import { Resource } from 'sst'
import { IMAGE_VARIANTS } from './constants.js'

export async function handleProcessingError(
  supabase: SupabaseClient,
  key: string,
  error: unknown,
) {
  const submissionError =
    error instanceof SubmissionProcessingError
      ? error
      : new SubmissionProcessingError([ErrorCode.UNKNOWN_ERROR], {
          originalError: error,
        })

  if (!submissionError.catalog) {
    console.error('Non saveable error:', submissionError)
    throw submissionError
  }

  await addMultipleSubmissionErrors(
    supabase,
    submissionError.catalog.map(c => ({
      submissionKey: key,
      errorCode: c.code,
      message: c.message,
      description: c.description,
      severity: c.severity,
      context: submissionError.context
        ? JSON.stringify(submissionError.context)
        : null,
    })),
  )
}

export async function validateMetadata(
  metadata: Record<string, any> | null,
  competitionRules: any,
) {
  //TODO: Implement metadata validation for the competition specific rules
  return [] as ErrorCode[]
}

export async function getPhotoFromS3(s3: S3Client, key: string) {
  try {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: Resource.SubmissionBucket.name,
        Key: key,
      }),
    )
    const file = await Body?.transformToByteArray()
    return { file: file ? sharp(file) : null, error: null }
  } catch (error) {
    return { file: null, error }
  }
}

export function parseKey(key: string) {
  const [domain, _, participantRef, orderIndex, fileName] = key.split('/')
  if (!domain || !participantRef || !orderIndex || !fileName) {
    return null
  }
  return { domain, participantRef, orderIndex, fileName }
}

export async function generateImageVariants(
  originalKey: string,
  photoInstance: sharp.Sharp,
  s3: S3Client,
) {
  try {
    const [thumbnailKey, previewKey] = await Promise.all([
      createVariant(originalKey, photoInstance, IMAGE_VARIANTS.thumbnail, s3),
      createVariant(originalKey, photoInstance, IMAGE_VARIANTS.preview, s3),
    ])

    const variants =
      thumbnailKey && previewKey ? { thumbnailKey, previewKey } : null
    return { variants, error: null }
  } catch (error) {
    return { variants: null, error }
  }
}

export async function createVariant(
  originalKey: string,
  photoInstance: sharp.Sharp,
  config: { width: number; prefix: string },
  s3: S3Client,
): Promise<string | null> {
  try {
    const parsedPath = parseKey(originalKey)
    if (!parsedPath) return null

    const variantBuffer = await photoInstance
      .clone()
      .resize(config.width)
      .toBuffer()
    const variantKey = [
      parsedPath.domain,
      config.prefix,
      parsedPath.participantRef,
      parsedPath.orderIndex,
      `${config.prefix}_${parsedPath.fileName}`,
    ].join('/')

    await s3.send(
      new PutObjectCommand({
        Bucket: Resource.SubmissionBucket.name,
        Key: variantKey,
        Body: variantBuffer,
      }),
    )

    return variantKey
  } catch (error) {
    return null
  }
}

export async function getExifMetadata(photoInstance: sharp.Sharp) {
  const metadata = await photoInstance.metadata()
  if (!metadata.exif) return null
  return exifr.parse(metadata.exif) as Record<string, any>
}
