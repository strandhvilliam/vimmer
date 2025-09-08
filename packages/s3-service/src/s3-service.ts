import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { Data, Effect, Option } from "effect"
import { S3EffectClient } from "./s3-effect-client"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

class S3ClientError extends Data.TaggedError("S3ClientError")<{
  message?: string
  cause?: unknown
}> {}

export class S3Service extends Effect.Service<S3Service>()(
  "@blikka/packages/s3-service",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      const s3Client = yield* S3EffectClient

      const getFile = (bucket: string, key: string) =>
        Effect.gen(function* () {
          const file = yield* s3Client.use((client) =>
            client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
          )

          if (!file.Body) {
            return Option.none<Buffer>()
          }
          const body = file.Body

          return yield* Effect.tryPromise({
            try: () => body.transformToByteArray(),
            catch: (error) =>
              new S3ClientError({
                cause: error,
                message: "Failed to transform to byte array",
              }),
          })
        })
      const getHead = (bucket: string, key: string) =>
        Effect.gen(function* () {
          const head = yield* s3Client.use((client) =>
            client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
          )
          return head
        })

      const getPresignedUrl = (bucket: string, key: string) => {
        Effect.gen(function* () {
          const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          })
          const client = yield* s3Client.use((client) => client)
          const presignedUrl = yield* Effect.tryPromise({
            try: () =>
              getSignedUrl(client, getObjectCommand, {
                expiresIn: 60 * 60 * 24,
              }),
            catch: (error) =>
              new S3ClientError({
                cause: error,
                message: "Failed to get presigned URL",
              }),
          })
          return presignedUrl
        })
      }
      const putFile = (bucket: string, key: string, file: Buffer) => {
        Effect.gen(function* () {
          const putObjectCommand = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file,
          })
          const client = yield* s3Client.use((client) => client)
          const presignedUrl = yield* Effect.tryPromise({
            try: () => client.send(putObjectCommand),
            catch: (error) =>
              new S3ClientError({
                cause: error,
                message: `Failed to put object key=${key}`,
              }),
          })
          return presignedUrl
        })
      }

      return {
        getFile,
        getHead,
        getPresignedUrl,
        putFile,
      } as const
    }),
  }
) {}
