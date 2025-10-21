import { Effect, Layer, Schema } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { parseJson } from "./utils"
import { InvalidS3EventError } from "./errors"
import { type SQSRecord } from "aws-lambda"
import { UploadProcessorService } from "./service"
import { S3EventSchema } from "./schemas"
import { TelemetryLayer } from "@blikka/telemetry"

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
        )
      }
    )

    yield* Effect.forEach(event.Records, (record) => processSQSRecord(record), {
      concurrency: 3,
    })
  }).pipe(
    Effect.withSpan("uploadProcessor.handler"),
    Effect.catchAll(Effect.logError)
  )

const serviceLayer = Layer.mergeAll(
  UploadProcessorService.Default,
  TelemetryLayer("blikka-dev-upload-processor")
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: serviceLayer,
})
