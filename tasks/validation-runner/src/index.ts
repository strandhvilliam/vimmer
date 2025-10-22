import { LambdaHandler } from "@effect-aws/lambda"
import { Effect, Layer } from "effect"
import { SQSEvent } from "@effect-aws/lambda"
import { parseFinalizedEvent } from "./utils"
import { ValidationRunner } from "./service"
import { TelemetryLayer } from "@blikka/telemetry"

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const validationRunner = yield* ValidationRunner

    yield* Effect.forEach(event.Records, (record) =>
      parseFinalizedEvent(record.body).pipe(
        Effect.flatMap(({ domain, reference }) => validationRunner.execute(domain, reference))
      )
    )
  }).pipe(Effect.withSpan("ValidationRunner.handler"), Effect.catchAll(Effect.logError))

const serviceLayer = Layer.mergeAll(
  ValidationRunner.Default,
  TelemetryLayer("blikka-dev-validation-runner")
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: serviceLayer,
})
