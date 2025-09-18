import { Effect, Schema } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { parseJson, InvalidS3EventError } from "./utils"
import { type SQSRecord } from "aws-lambda"
import { UploadProcessorService } from "./upload-processor-service"

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
    const uploadProcessor = yield* UploadProcessorService

    const processSQSRecord = Effect.fn("upload-processor.processSQSRecord")(
      function* (record: SQSRecord) {
        const s3Event = yield* parseJson(record.body).pipe(
          Effect.flatMap(Schema.decodeUnknown(S3EventSchema)),
          Effect.mapError(
            (cause) =>
              new InvalidS3EventError({
                cause,
                message: "Failed to parse S3 event",
              })
          )
        )

        yield* Effect.forEach(
          s3Event.Records,
          (record) =>
            Effect.gen(function* () {
              const key = record.s3.object.key
              return yield* uploadProcessor.processPhoto(key)
            }),
          { concurrency: 2 }
        ).pipe(
          Effect.catchTag("PhotoNotFoundError", (error) =>
            Effect.logError("Photo not found", error)
          ),
          Effect.catchTag("FailedToIncrementParticipantStateError", (error) =>
            Effect.logError("Failed to increment participant state", error)
          ),
          Effect.catchTag("InvalidKeyFormatError", (error) =>
            Effect.logError("Invalid S3 event", error)
          )
        )
      },
      Effect.catchAll((error) =>
        Effect.logError("Failed to process SQS record", error)
      )
    )

    yield* Effect.forEach(event.Records, (record) => processSQSRecord(record), {
      concurrency: 3,
    })
  }).pipe(Effect.withSpan("uploadProcessor.handler"))

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: UploadProcessorService.Default,
})
