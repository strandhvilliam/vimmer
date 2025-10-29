import { HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Layer, Schema } from "effect"
import { PubSubChannel, PubSubMessage, PubSubService } from "@blikka/pubsub"
import { PubSubLoggerLayer } from "@blikka/pubsub"
import { createEffectWebHandler, parseSearchParams } from "app/lib/utils"

const effectHandler = Effect.gen(function* () {
  const pubsub = yield* PubSubService
  const request = yield* HttpServerRequest.HttpServerRequest
  const { message: messageString } = yield* HttpServerRequest.schemaBodyJson(
    Schema.Struct({
      message: Schema.String,
    })
  )
  const channel = yield* parseSearchParams(request, Schema.Struct({ channel: Schema.String })).pipe(
    Effect.andThen(({ channel }) => PubSubChannel.parse(channel))
  )

  return yield* PubSubMessage.create(channel, messageString).pipe(
    Effect.andThen((message) => pubsub.publish(channel, message)),
    Effect.andThen(() =>
      HttpServerResponse.json(
        {
          message: "Message published",
        },
        { status: 200 }
      )
    )
  )
}).pipe(
  Effect.withSpan("publish-message"),
  Effect.tapError((error) =>
    Effect.logError(error._tag === "HttpBodyError" ? error : error.message)
  ),
  Effect.catchTags({
    ChannelParseError: (error) =>
      HttpServerResponse.json({ error: error.message }, { status: 400 }),
  }),
  Effect.catchAllCause(() => HttpServerResponse.empty({ status: 500 }))
)

const mainLive = Layer.mergeAll(PubSubService.Default, PubSubLoggerLayer)
const handler = await createEffectWebHandler(mainLive, effectHandler)

export const POST = handler
