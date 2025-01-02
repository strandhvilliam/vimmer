import { S3Client } from '@aws-sdk/client-s3'
import { createClient } from '@vimmer/supabase/lambda'
import { S3Event, SQSEvent } from 'aws-lambda'
import { processSubmission } from './processor.js'

export const handler = async (event: SQSEvent): Promise<void> => {
  const s3 = new S3Client()
  const supabase = await createClient()

  const keys = event.Records.map(r => JSON.parse(r.body) as S3Event).flatMap(
    e => e.Records.map(r => decodeURIComponent(r.s3.object.key)),
  )

  await Promise.all(keys.map(key => processSubmission(key, s3, supabase)))
}
