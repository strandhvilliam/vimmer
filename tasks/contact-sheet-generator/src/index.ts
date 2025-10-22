import { Effect, Layer } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { SheetGeneratorService } from "./sheet-generator-service"
import { TelemetryLayer } from "@blikka/telemetry"
import { EventBusDetailTypes, FinalizedEventSchema, parseBusEvent } from "@blikka/bus"

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const sheetGeneratorService = yield* SheetGeneratorService
    yield* Effect.forEach(
      event.Records,
      (record) =>
        parseBusEvent<typeof EventBusDetailTypes.Finalized, typeof FinalizedEventSchema.Type>(
          record.body,
          FinalizedEventSchema
        ).pipe(Effect.flatMap((args) => sheetGeneratorService.generateContactSheet(args))),
      { concurrency: 2 }
    )
  }).pipe(Effect.withSpan("SheetGeneratorService.handler"), Effect.catchAll(Effect.logError))

const serviceLayer = Layer.mergeAll(
  SheetGeneratorService.Default,
  TelemetryLayer("blikka-dev-contact-sheet-generator")
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: serviceLayer,
})
