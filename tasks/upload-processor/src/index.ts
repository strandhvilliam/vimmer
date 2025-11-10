import { Effect, Layer, Schema } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { parseJson, parseKey } from "./utils"
import { InvalidS3EventError } from "./errors"
import { type SQSRecord } from "aws-lambda"
import { UploadProcessorService } from "./service"
import { S3EventSchema } from "./schemas"
import { TelemetryLayer } from "@blikka/telemetry"
import { PubSubChannel, RunStateService, PubSubLoggerService } from "@blikka/pubsub"
import { Resource as SSTResource } from "sst"

const getEnvironment = (stage: string): "prod" | "dev" | "staging" => {
  if (stage === "production") return "prod"
  if (stage === "dev" || stage === "development") return "dev"
  return "staging"
}

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const uploadProcessor = yield* UploadProcessorService
    const runStateService = yield* RunStateService
    const environment = getEnvironment(SSTResource.App.stage)

    const processSQSRecord = Effect.fn("upload-processor.processSQSRecord")(function* (
      record: SQSRecord
    ) {
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
            const { domain, reference } = yield* parseKey(key)

            yield* Effect.log(
              `Processing photo ${key} for domain ${domain} and reference ${reference}`
            )

            return yield* PubSubChannel.fromString(
              `${environment}:upload-flow:${domain}-${reference}`
            ).pipe(
              Effect.andThen((channel) =>
                runStateService.withRunStateEvents(
                  "upload-processor",
                  channel,
                  uploadProcessor.processPhoto(key)
                )
              )
            )
          }),
        { concurrency: 2 }
      )
    })

    yield* Effect.forEach(event.Records, (record) => processSQSRecord(record), {
      concurrency: 3,
    })
  }).pipe(Effect.withSpan("uploadProcessor.handler"), Effect.catchAll(Effect.logError))

const serviceLayer = Layer.mergeAll(
  UploadProcessorService.Default,
  RunStateService.Default,
  PubSubLoggerService.withTaskName("upload-processor"),
  TelemetryLayer("blikka-dev-upload-processor")
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: serviceLayer,
})
