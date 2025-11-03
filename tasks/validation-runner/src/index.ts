import { LambdaHandler, EventBridgeEvent } from "@effect-aws/lambda"
import { Effect, Layer } from "effect"
import { SQSEvent } from "@effect-aws/lambda"
import { EventBusDetailTypes, parseBusEvent } from "@blikka/bus"
import { FinalizedEventSchema } from "@blikka/bus"
import { ValidationRunner } from "./service"
import { TelemetryLayer } from "@blikka/telemetry"
import { PubSubChannel, PubSubLoggerService, RunStateService } from "@blikka/pubsub"
import { Resource as SSTResource } from "sst"

const getEnvironment = (stage: string): "prod" | "dev" | "staging" => {
  if (stage === "production") return "prod"
  if (stage === "dev" || stage === "development") return "dev"
  return "staging"
}

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const validationRunner = yield* ValidationRunner
    const runStateService = yield* RunStateService
    const environment = getEnvironment(SSTResource.App.stage)

    yield* Effect.forEach(event.Records, (record) =>
      parseBusEvent<typeof EventBusDetailTypes.Finalized, typeof FinalizedEventSchema.Type>(
        record.body,
        FinalizedEventSchema
      ).pipe(
        Effect.flatMap(({ domain, reference }) =>
          PubSubChannel.fromString(`${environment}:upload-flow:${domain}-${reference}`).pipe(
            Effect.andThen((channel) =>
              runStateService.withRunStateEvents(
                "validation-runner",
                channel,
                validationRunner.execute(domain, reference)
              )
            )
          )
        )
      )
    )
  }).pipe(Effect.withSpan("ValidationRunner.handler"), Effect.catchAll(Effect.logError))

const serviceLayer = Layer.mergeAll(
  ValidationRunner.Default,
  RunStateService.Default,
  PubSubLoggerService.withTaskName("validation-runner"),
  TelemetryLayer("blikka-dev-validation-runner")
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: serviceLayer,
})
