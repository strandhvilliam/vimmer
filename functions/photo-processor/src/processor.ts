import { ErrorCode, SubmissionProcessingError } from '@vimmer/utils/errors'
import { S3Client } from '@aws-sdk/client-s3'
import {
  generateImageVariants,
  getExifMetadata,
  getPhotoFromS3,
  handleProcessingError,
  parseKey,
  validateMetadata,
} from './helpers.js'
import { SupabaseClient } from '@vimmer/supabase/types'
import {
  updateSubmissionById,
  updateSubmissionByKey,
} from '@vimmer/supabase/mutations'

export async function processSubmission(
  key: string,
  s3: S3Client,
  supabase: SupabaseClient,
) {
  try {
    const parsedPath = parseKey(key)
    if (!parsedPath) {
      throw new SubmissionProcessingError([ErrorCode.INVALID_KEY_FORMAT], {
        key,
      })
    }

    const { data: submission, error: statusError } =
      await updateSubmissionByKey(supabase, key, {
        status: 'processing',
      })

    if (statusError || !submission) {
      throw new SubmissionProcessingError(
        [ErrorCode.SUBMISSION_MUTATION_FAILED],
        { statusError },
      )
    }

    const { file: photoInstance, error: s3Error } = await getPhotoFromS3(
      s3,
      key,
    )

    if (s3Error || !photoInstance) {
      throw new SubmissionProcessingError([ErrorCode.FAILED_TO_FETCH_PHOTO], {
        s3Error,
      })
    }

    const metadata = await getExifMetadata(photoInstance)
    if (!metadata) {
      throw new SubmissionProcessingError([ErrorCode.NO_METADATA], { metadata })
    }
    const validationErrors = await validateMetadata(photoInstance, {})
    if (validationErrors.length > 0) {
      throw new SubmissionProcessingError(validationErrors, { metadata })
    }

    const { variants, error } = await generateImageVariants(
      key,
      photoInstance,
      s3,
    )

    if (error || !variants) {
      throw new SubmissionProcessingError(
        [ErrorCode.IMAGE_VARIANT_CREATION_FAILED],
        { error },
      )
    }

    const { error: updateError } = await updateSubmissionById(
      supabase,
      submission.id,
      {
        status: 'completed',
        thumbnailKey: variants.thumbnailKey,
        previewKey: variants.previewKey,
      },
    )

    if (updateError) {
      throw new SubmissionProcessingError(
        [ErrorCode.SUBMISSION_MUTATION_FAILED],
        { updateError },
      )
    }
  } catch (error) {
    await handleProcessingError(supabase, key, error)
    throw error
  }
}
