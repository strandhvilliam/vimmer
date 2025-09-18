import { task } from "sst/aws/task"
import { Data, Effect } from "effect"
import { LambdaHandler, type EffectHandler } from "@effect-aws/lambda"
import { type SQSEvent } from "aws-lambda"
import { Resource as SSTResource } from "sst"

class UnableToRunZipHandlerTaskError extends Data.TaggedError(
  "UnableToRunZipHandlerTaskError"
)<{
  cause?: unknown
}> {}

const effectHandler: EffectHandler<SQSEvent, never, never, void> = Effect.fn(
  "zip-handler.handler"
)(function* (event) {
  yield* Effect.forEach(event.Records, (record) =>
    Effect.gen(function* () {
      yield* Effect.tryPromise({
        try: () => task.run(SSTResource.ZipHandlerTask, {}),
        catch: (error) => new UnableToRunZipHandlerTaskError({ cause: error }),
      })
    }).pipe(
      Effect.catchTag("UnableToRunZipHandlerTaskError", (error) =>
        Effect.logError("Unable to run zip handler task", error)
      )
    )
  )
})

export const handler = LambdaHandler.make(effectHandler)
