import { PubSubMessage } from "@blikka/pubsub"
import { Chunk, Effect, Schema, Stream } from "effect"

export class SseListener extends Effect.Service<SseListener>()("@blikka/observer/sse-listener", {
  scoped: Effect.gen(function* () {
    const createStream = Effect.fnUntraced(function* (url: string) {
      if (typeof window === "undefined") {
        return Effect.die(new Error("EventSource is only available in browser"))
      }

      return Stream.acquireRelease(
        Effect.sync(() => new EventSource(url)),
        (source) =>
          Effect.log("Closing source for url: " + url).pipe(Effect.andThen(() => source.close()))
      ).pipe(
        Stream.flatMap((source) =>
          Stream.fromEventListener<MessageEvent>(source, "message").pipe(
            Stream.flatMap((event) => Effect.try(() => JSON.parse(event.data))),
            Stream.flatMap((json) => Schema.decodeUnknown(PubSubMessage)(json)),
            Stream.mapAccum(Chunk.empty<PubSubMessage>(), (state, message) => [
              Chunk.append(state, message),
              [...state, message],
            ]),
            Stream.catchAll((error) => Stream.die(error))
          )
        )
      )
    })

    return { createStream }
  }),
}) {}
