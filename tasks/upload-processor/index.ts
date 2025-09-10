import { Console, Effect, Either, Layer, Logger, Option, Schema } from "effect"
import { S3Service } from "@blikka/s3"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { parseJson, parseKey } from "./src/utils"
import { UploadKVRepository } from "@blikka/kv-store"
import { SharpImageService } from "@blikka/image-manipulation"

const S3EventSchema = Schema.Struct({
  Records: Schema.Array(
    Schema.Struct({
      s3: Schema.Struct({
        object: Schema.Struct({
          key: Schema.String,
        }),
        bucket: Schema.Struct({
          name: Schema.String,
        }),
      }),
    })
  ),
})

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const s3 = yield* S3Service
    const kv = yield* UploadKVRepository
    const sharp = yield* SharpImageService

    yield* Effect.forEach(
      event.Records,
      (record) =>
        Effect.gen(function* () {
          const body = yield* parseJson(record.body).pipe(
            Effect.map(Schema.decodeUnknownEither(S3EventSchema))
          )
          if (Either.isLeft(body)) {
            Console.error("Invalid S3 event", body.left)
            return
          }
          const { Records } = body.right

          for (const record of Records) {
            const { domain, reference, orderIndex, fileName } = yield* parseKey(
              record.s3.object.key
            )
            const photo = yield* s3.getFile(
              record.s3.bucket.name,
              record.s3.object.key
            )

            if (Option.isNone(photo)) {
              Console.error("Photo not found", record.s3.object.key)
              return
            }

            const resized = yield* sharp.resize(Buffer.from(photo.value), {
              width: 400,
            })

            yield* s3.putFile(
              record.s3.bucket.name,
              record.s3.object.key,
              resized
            )
          }

          // for (const key of keys) {
          //   const { domain, reference, orderIndex, fileName } =
          //     yield* parseKey(key)
          // }

          // process each key
          // parse key to [domain, participantRef, orderIndex, fileName]
          // get submission from s3
          // generate thumbnail
          // parse exif data
          // update submissionstate
          // increment participant upload count

          return Effect.void
        }),
      { concurrency: "unbounded" }
    ).pipe(Effect.catchAll((error) => Effect.logError(error)))
  })

const MainLayer = Layer.mergeAll(
  S3Service.Default,
  UploadKVRepository.Default,
  SharpImageService.Default
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: MainLayer,
})
