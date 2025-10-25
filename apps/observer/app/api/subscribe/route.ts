import { Chunk, Effect, Layer, ManagedRuntime, Stream } from "effect"
import { HttpApp, HttpServerResponse } from "@effect/platform"
import { PubSubChannel, PubSubMessage, PubSubService } from "@blikka/pubsub"

const effectHandler = Effect.gen(function* () {
  const pubsub = yield* PubSubService

  const channel = yield* PubSubChannel.fromString("prod:upload-flow:logger")
  const subscription = pubsub.subscribe(channel)

  const initialChunk = Chunk.of(JSON.stringify({ message: "connected" }))

  const sseStream = Stream.prepend(subscription, initialChunk).pipe(
    Stream.map((data) => new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))
  )

  const response = yield* HttpServerResponse.stream(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
  return response
})

const mainLive = Layer.mergeAll(PubSubService.Default)
const managedRuntime = ManagedRuntime.make(mainLive)
const runtime = await managedRuntime.runtime()
const handler = HttpApp.toWebHandlerRuntime(runtime)(effectHandler)

type Handler = (req: Request) => Promise<Response>

export const GET: Handler = handler
