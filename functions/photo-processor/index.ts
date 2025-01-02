import { createClient } from '@vimmer/supabase/lambda'
import { insertLog } from '@vimmer/supabase/mutations'
import { Handler, S3Event, SQSEvent } from 'aws-lambda'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Resource } from 'sst'
import sharp from 'sharp'
import exifr from 'exifr'

export const handler = async (event: SQSEvent) => {
  const keys = event.Records.map(r => JSON.parse(r.body) as S3Event).flatMap(
    e => e.Records.map(r => decodeURIComponent(r.s3.object.key)),
  )

  const s3 = new S3Client()
  const supabase = await createClient()
  console.log('bucketName', Resource.SubmissionBucket.name)

  for (const key of keys) {
    console.log('Processing', key)

    // update submission status to processing

    const getCommand = new GetObjectCommand({
      Bucket: Resource.SubmissionBucket.name,
      Key: key,
    })

    const output = await s3.send(getCommand)
    const file = await output.Body?.transformToByteArray()

    if (!file) {
      console.error('Failed to get file', key)
      continue
    }

    const photoInstance = sharp(file)
    const metadata = await getExifMetadata(photoInstance)
    const isValid = validateMetadata(metadata, {})
    const thumbnail = await generateThumbnail(photoInstance)

    const photoKey = [domain, 'photos', participantRef, orderIndex].join('/')
    const thumbnailKey = [
      domain,
      'thumbnails',
      participantRef,
      orderIndex,
    ].join('/')

    // validate metadata

    // use sharp to generate thumbnail
    // save thumbnail and metadata to s3
  }
  // get file

  // extract metadata

  // validate metadata

  // use sharp to generate thumbnail

  // save thumbnail and metadata to s3

  return 'ok'
}

function generateKey(
  type: 'photos' | 'thumbnails',
  domain: string,
  participantRef: string,
  orderIndex: number,
  fileType: string,
) {
  return [domain, type, participantRef, orderIndex].join('/')
  return `${domain}/${type}/${participantRef}/${orderIndex}.${fileType}`
  // domain_photo_participantRef_orderIndex.fileType
  // demo2025_photos_0024_01.jpg
  // domain/photos/participantRef/orderIndex.fileType
  // domain/thumbnails/participantRef/orderIndex.fileType
  // demo2025/photos/0024/01.jpg
}

function validateMetadata(
  metadata: Record<string, any> | null,
  competitionRules: any,
) {
  //TODO: validate metadata against competition rules
  return true
}

async function getExifMetadata(photoInstance: sharp.Sharp) {
  const metadata = await photoInstance.metadata()
  if (!metadata.exif) {
    return null
  }
  return exifr.parse(metadata.exif) as Record<string, any>
}

async function generateThumbnail(photoInstance: sharp.Sharp) {
  return photoInstance.resize(200, 200).toBuffer()
}
