import { Data, Effect, Schema } from "effect"
import { type EventBridgeEvent } from "@effect-aws/lambda"
import type { EventBusDetailTypes } from "./event-types"
import { FinalizedEventSchema } from "./schemas"

export class InvalidBusEventBodyError extends Data.TaggedError("InvalidBusEventBodyError")<{
  message?: string
  cause?: unknown
}> {}

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  message?: string
  cause?: unknown
}> {}

export const parseBusEvent = Effect.fn("BlikkaBus.parseBusEvent")(
  function* <
    TDetailType extends (typeof EventBusDetailTypes)[keyof typeof EventBusDetailTypes],
    TDetailSchema,
  >(input: string, detailSchema: Schema.Schema<TDetailSchema>) {
    const json = (yield* Effect.try({
      try: () => JSON.parse(input),
      catch: () => new JsonParseError({ message: "JSON parse error" }),
    })) as EventBridgeEvent<TDetailType, TDetailSchema>
    return yield* Schema.decodeUnknown(detailSchema)(json.detail)
  },
  Effect.mapError(
    (error) =>
      new InvalidBusEventBodyError({
        message: `Failed to parse bus event: ${error.message}`,
        cause: error.cause,
      })
  )
)
