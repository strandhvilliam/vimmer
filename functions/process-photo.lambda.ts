import { Handler, S3Event } from 'aws-lambda'

export const handler: Handler<S3Event> = async () => {
  // extract metadata
  // use sharp to generate thumbnail
  // save thumbnail to s3
  // save metadata and thumbnail key to supabase
  // set submission status to 'completed'
}
