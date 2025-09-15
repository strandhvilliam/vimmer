import { Effect, Layer } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    console.log("running contact sheet generator")

    yield* Effect.forEach(
      event.Records,
      (record) =>
        Effect.gen(function* () {
          console.log(record)
        }),
      {
        concurrency: 3,
      }
    )
  }).pipe(
    Effect.withSpan("uploadProcessor.handler"),
    Effect.tapError((error) =>
      Effect.logError("Handler failed with error", error)
    )
  )

class FakeService extends Effect.Service<FakeService>()(
  "@blikka/contact-sheet-generator/fake-service",
  {
    sync: () => ({
      fake: () => Effect.succeed("fake"),
    }),
  }
) {}

const MainLayer = Layer.mergeAll(FakeService.Default)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: MainLayer,
})
