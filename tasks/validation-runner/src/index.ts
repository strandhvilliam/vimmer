import { LambdaHandler, EventBridgeEvent } from "@effect-aws/lambda"
import { Effect, Layer } from "effect"
import { SQSEvent } from "@effect-aws/lambda"
import { EventBusDetailTypes, parseBusEvent } from "@blikka/bus"
import { FinalizedEventSchema } from "@blikka/bus"
import { ValidationRunner } from "./service"
import { TelemetryLayer } from "@blikka/telemetry"
import { PubSubChannel, PubSubLoggerService, RunStateService } from "@blikka/pubsub"
import { Resource as SSTResource } from "sst"
import { SQSRecord } from "aws-lambda"

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

    const processSQSRecord = Effect.fn("validation-runner.processSQSRecord")(function* (
      record: SQSRecord
    ) {
      const { domain, reference } = yield* parseBusEvent<
        typeof EventBusDetailTypes.Finalized,
        typeof FinalizedEventSchema.Type
      >(record.body, FinalizedEventSchema)

      yield* Effect.logInfo(`[${reference}|${domain}] Executing validation`)

      return yield* runStateService.withRunStateEvents({
        taskName: "validation-runner",
        channel: yield* PubSubChannel.fromString(
          `${environment}:upload-flow:${domain}-${reference}`
        ),
        effect: validationRunner.execute(domain, reference).pipe(
          Effect.tap(() => Effect.logInfo(`[${reference}|${domain}] Validation executed`)),
          Effect.tapError((error) =>
            Effect.logError(`[${reference}|${domain}] Error executing validation`, error)
          )
        ),
        metadata: {
          domain,
          reference,
        },
      })
    })

    yield* Effect.forEach(event.Records, (record) => processSQSRecord(record), { concurrency: 2 })
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
