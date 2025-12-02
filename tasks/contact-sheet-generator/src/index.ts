import { Effect, Layer } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { SheetGeneratorService } from "./sheet-generator-service"
import { TelemetryLayer } from "@blikka/telemetry"
import { EventBusDetailTypes, FinalizedEventSchema, parseBusEvent } from "@blikka/bus"
import { PubSubChannel, RunStateService, PubSubLoggerService } from "@blikka/pubsub"
import { Resource as SSTResource } from "sst"
import { SQSRecord } from "aws-lambda"

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

    const processSQSRecord = Effect.fn("contact-sheet-generator.processSQSRecord")(function* (
      record: SQSRecord
    ) {
      const { domain, reference } = yield* parseBusEvent<
        typeof EventBusDetailTypes.Finalized,
        typeof FinalizedEventSchema.Type
      >(record.body, FinalizedEventSchema)

      yield* Effect.logInfo(`[${reference}|${domain}] Generating contact sheet`)

      return yield* runStateService.withRunStateEvents({
        taskName: "contact-sheet-generator",
        channel: yield* PubSubChannel.fromString(
          `${environment}:upload-flow:${domain}-${reference}`
        ),
        effect: sheetGeneratorService.generateContactSheet({ domain, reference }).pipe(
          Effect.tap(() => Effect.logInfo(`[${reference}|${domain}] Contact sheet generated`)),
          Effect.tapError((error) =>
            Effect.logError(
              `[${reference}|${domain}] Error generating contact sheet`,
              error.message
            )
          )
        ),
        metadata: { domain, reference },
      })
    })

    yield* Effect.forEach(event.Records, (record) => processSQSRecord(record), { concurrency: 2 })
  }).pipe(Effect.withSpan("SheetGeneratorService.handler"), Effect.catchAll(Effect.logError))

const serviceLayer = Layer.mergeAll(
  SheetGeneratorService.Default,
  RunStateService.Default,
  PubSubLoggerService.withTaskName("contact-sheet-generator"),
  TelemetryLayer("blikka-dev-contact-sheet-generator")
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: serviceLayer,
})
