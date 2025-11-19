import { SQSEvent } from "aws-lambda"
import { Effect, Layer } from "effect"
import { LambdaHandler } from "@effect-aws/lambda"
import { PubSubChannel, PubSubLoggerService, RunStateService } from "@blikka/pubsub"
import { TelemetryLayer } from "@blikka/telemetry"
import { EventBusDetailTypes, FinalizedEventSchema, parseBusEvent } from "@blikka/bus"
import { getEnvironment } from "./utils"
import { UploadFinalizerService } from "./service"

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const environment = getEnvironment()
    const runStateService = yield* RunStateService
    const uploadFinalizerService = yield* UploadFinalizerService

    yield* Effect.forEach(event.Records, (record) =>
      parseBusEvent<typeof EventBusDetailTypes.Finalized, typeof FinalizedEventSchema.Type>(
        record.body,
        FinalizedEventSchema
      ).pipe(
        Effect.andThen(({ domain, reference }) =>
          PubSubChannel.fromString(`${environment}:upload-flow:${domain}-${reference}`).pipe(
            Effect.andThen((channel) =>
              runStateService.withRunStateEvents({
                taskName: "upload-finalizer",
                channel,
                effect: uploadFinalizerService.finalizeParticipant(domain, reference),
                metadata: {
                  domain,
                  reference,
                },
              })
            )
          )
        )
      )
    )
  }).pipe(Effect.withSpan("UploadFinalizer.handler"), Effect.catchAll(Effect.logError))

const serviceLayer = Layer.mergeAll(
  RunStateService.Default,
  UploadFinalizerService.Default,
  PubSubLoggerService.withTaskName("upload-finalizer"),
  TelemetryLayer(`blikka-${getEnvironment()}-upload-finalizer`)
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: serviceLayer,
})
