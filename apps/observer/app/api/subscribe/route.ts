import { Chunk, Effect, Layer, Schema, Stream } from "effect"
import { HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { PubSubChannel, PubSubMessage, PubSubService } from "@blikka/pubsub"
import { createEffectWebHandler, InitialMessagePayload, parseSearchParams } from "app/lib/utils"

const effectHandler = Effect.gen(function* () {
  const pubsub = yield* PubSubService
  const request = yield* HttpServerRequest.HttpServerRequest

  const channel = yield* parseSearchParams(request, Schema.Struct({ channel: Schema.String })).pipe(
    Effect.andThen(({ channel }) => PubSubChannel.parse(channel))
  )
  const subscription = pubsub
    .subscribe(channel)
    .pipe(Stream.map((data) => new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)))

  return HttpServerResponse.stream(subscription, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}).pipe(
  Effect.withSpan("subscribe-to-channel"),
  Effect.tapError((error) => Effect.logError(error.message)),
  Effect.catchTags({
    SearchParamParseError: (error) =>
      HttpServerResponse.json({ error: error.message }, { status: 400 }),
    ChannelParseError: (error) =>
      HttpServerResponse.json({ error: error.message }, { status: 400 }),
  }),
  Effect.catchAllCause(() => HttpServerResponse.empty({ status: 500 }))
)

const mainLive = Layer.mergeAll(PubSubService.Default)
const handler = await createEffectWebHandler(mainLive, effectHandler)

export const GET = handler
