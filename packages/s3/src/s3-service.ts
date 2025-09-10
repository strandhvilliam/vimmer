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
    dependencies: [S3EffectClient.Default],
    effect: Effect.gen(function* () {
      const s3Client = yield* S3EffectClient

      const getFile = Effect.fn("S3Service.getFile")(function* (
        bucket: string,
        key: string
      ) {
        const file = yield* s3Client.use((client) =>
          client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
        )

        if (!file.Body) {
          return Option.none<Uint8Array<ArrayBufferLike>>()
        }
        const body = file.Body

        const fileBuffer = yield* Effect.tryPromise({
          try: () => body.transformToByteArray(),
          catch: (error) =>
            new S3ClientError({
              cause: error,
              message: "Failed to transform to byte array",
            }),
        })
        return Option.some(fileBuffer)
      })
      const getHead = Effect.fn("S3Service.getHead")(function* (
        bucket: string,
        key: string
      ) {
        const head = yield* s3Client.use((client) =>
          client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
        )
        return head
      })

      const getPresignedUrl = Effect.fn("S3Service.getPresignedUrl")(function* (
        bucket: string,
        key: string
      ) {
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

      const putFile = Effect.fn("S3Service.putFile")(function* (
        bucket: string,
        key: string,
        file: Buffer
      ) {
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

      return {
        getFile,
        getHead,
        getPresignedUrl,
        putFile,
      } as const
    }),
  }
) {}
