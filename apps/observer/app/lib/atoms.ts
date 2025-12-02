import { Atom } from "@effect-atom/atom-react"
import { SseListener } from "app/lib/services/sse-listener"
import { PubSubChannel } from "@blikka/pubsub"
import { Stream, Effect } from "effect"

export const sseAtomRuntime = Atom.runtime(SseListener.Default)

export const sseAtom = Atom.family((channelString: string) =>
  sseAtomRuntime.atom(() =>
    Stream.unwrap(
      Effect.gen(function* () {
        const sse = yield* SseListener
        yield* PubSubChannel.parse(channelString)
        return yield* sse.createStream(`/api/subscribe?channel=${channelString}`)
      })
    )
  )
)
