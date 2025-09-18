import { Data, Effect, Schema } from "effect"
import { FinalizedEventSchema } from "@blikka/bus"

export class InvalidBodyError extends Data.TaggedError("InvalidBodyError")<{
  message?: string
  cause?: unknown
}> {}

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  message?: string
}> {}

export const parseFinalizedEvent = Effect.fn(
  "contactSheetGenerator.parseFinalizedEvent"
)(
  function* (input: string) {
    const json = yield* Effect.try({
      try: () => JSON.parse(input),
      catch: (unknown) =>
        new JsonParseError({ message: "Failed to parse JSON" }),
    })
    const params = yield* Schema.decodeUnknown(FinalizedEventSchema)(json)
    return params
  },
  Effect.mapError(
    (error) =>
      new InvalidBodyError({
        message: "Failed to parse finalized event",
        cause: error,
      })
  )
)
