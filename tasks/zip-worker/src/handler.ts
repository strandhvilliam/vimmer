import { task } from "sst/aws/task"
import { Data, Effect, Option } from "effect"
import { LambdaHandler, type EffectHandler } from "@effect-aws/lambda"
import { type SQSEvent } from "aws-lambda"
import { Resource as SSTResource } from "sst"
import { UploadKVRepository } from "@blikka/kv-store"
import { parseFinalizedEvent } from "./utils"

class UnableToRunZipHandlerTaskError extends Data.TaggedError(
  "UnableToRunZipHandlerTaskError"
)<{
  cause?: unknown
}> {}

const effectHandler = Effect.fn("zip-handler.handler")(
  function* (event: SQSEvent) {
    const kvStore = yield* UploadKVRepository
    yield* Effect.forEach(event.Records, (record) =>
      Effect.gen(function* () {
        const { domain, reference } = yield* parseFinalizedEvent(record.body)

        const participantStateOpt = yield* kvStore.getParticipantState(
          domain,
          reference
        )

        if (
          Option.isSome(participantStateOpt) &&
          !!participantStateOpt.value.zipKey
        ) {
          yield* Effect.log("Participant already zipped, skipping")
          return
        }

        yield* Effect.tryPromise({
          try: () => task.run(SSTResource.ZipHandlerTask, {}),
          catch: (error) =>
            new UnableToRunZipHandlerTaskError({ cause: error }),
        })
      }).pipe(
        Effect.catchTag("UnableToRunZipHandlerTaskError", (error) =>
          Effect.logError("Unable to run zip handler task", error)
        )
      )
    )
  },
  Effect.catchAll((error) =>
    Effect.logError("Error running zip handler", error)
  )
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: UploadKVRepository.Default,
})
