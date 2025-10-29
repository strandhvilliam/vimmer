import { Effect, Layer } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { SheetGeneratorService } from "./sheet-generator-service"
import { TelemetryLayer } from "@blikka/telemetry"
import { EventBusDetailTypes, FinalizedEventSchema, parseBusEvent } from "@blikka/bus"
import { PubSubLoggerLayer, PubSubChannel, RunStateService } from "@blikka/pubsub"
import { Resource as SSTResource } from "sst"

const getEnvironment = (stage: string): "prod" | "dev" | "staging" => {
  if (stage === "production") return "prod"
  if (stage === "dev" || stage === "development") return "dev"
  return "staging"
}

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const sheetGeneratorService = yield* SheetGeneratorService
    const runStateService = yield* RunStateService
    const environment = getEnvironment(SSTResource.App.stage)

    yield* Effect.forEach(
      event.Records,
      (record) =>
        parseBusEvent<typeof EventBusDetailTypes.Finalized, typeof FinalizedEventSchema.Type>(
          record.body,
          FinalizedEventSchema
        ).pipe(
          Effect.flatMap(({ domain, reference }) =>
            PubSubChannel.fromString(`${environment}:upload-flow:${domain}-${reference}`).pipe(
              Effect.andThen((channel) =>
                runStateService.withRunStateEvents(
                  "contact-sheet-generator",
                  channel,
                  sheetGeneratorService.generateContactSheet({ domain, reference })
                )
              )
            )
          )
        ),
      { concurrency: 2 }
    )
  }).pipe(Effect.withSpan("SheetGeneratorService.handler"), Effect.catchAll(Effect.logError))

const serviceLayer = Layer.mergeAll(
  SheetGeneratorService.Default,
  RunStateService.Default,
  PubSubLoggerLayer,
  TelemetryLayer("blikka-dev-contact-sheet-generator")
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: serviceLayer,
})
