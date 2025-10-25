import { HttpApp, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Layer, ManagedRuntime, Schema } from "effect"
import { PubSubChannel, PubSubService } from "@blikka/pubsub"

const effectHandler = Effect.gen(function* () {
  const pubsub = yield* PubSubService
  const { message } = yield* HttpServerRequest.schemaBodyJson(
    Schema.Struct({
      message: Schema.String,
    })
  )
  yield* PubSubChannel.fromString("prod:upload-flow:test").pipe(
    Effect.andThen((channel) => pubsub.publish(channel, message))
  )
  return yield* HttpServerResponse.json({
    message: "Message published",
  })
})

const mainLive = Layer.mergeAll(PubSubService.Default)

const managedRuntime = ManagedRuntime.make(mainLive)
const runtime = await managedRuntime.runtime()
const handler = HttpApp.toWebHandlerRuntime(runtime)(effectHandler)

type Handler = (req: Request) => Promise<Response>
export const POST: Handler = handler
