import { HttpApp, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Layer, ManagedRuntime, Schema } from "effect"
import { PubSubChannel, PubSubMessage, PubSubService } from "@blikka/pubsub"
import { PubSubLoggerLayer } from "@blikka/pubsub"
const effectHandler = Effect.gen(function* () {
  const pubsub = yield* PubSubService
  const { message: messageString } = yield* HttpServerRequest.schemaBodyJson(
    Schema.Struct({
      message: Schema.String,
    })
  )
  yield* Effect.log("RUNNING")
  const channel = yield* PubSubChannel.fromString("prod:upload-flow:test")
  const message = yield* PubSubMessage.create(channel, messageString)
  yield* pubsub.publish(channel, message)
  return yield* HttpServerResponse.json({
    message: "Message published",
  })
})

const mainLive = Layer.mergeAll(PubSubService.Default, PubSubLoggerLayer)

const managedRuntime = ManagedRuntime.make(mainLive)
const runtime = await managedRuntime.runtime()
const handler = HttpApp.toWebHandlerRuntime(runtime)(effectHandler)

type Handler = (req: Request) => Promise<Response>
export const POST: Handler = handler
