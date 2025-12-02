"use client"

import { Chunk, Schema, Stream } from "effect"
import { PubSubMessage } from "@blikka/pubsub"
import { Atom, useAtom, useAtomValue } from "@effect-atom/atom-react"
import { useEffect } from "react"

const emptyStreamAtom = Atom.make(Stream.make([] as PubSubMessage[]))
const liveAtomStore = Atom.make({ atom: emptyStreamAtom })

export const useSseStream = (url: string) => {
  const [liveAtom, setLiveAtom] = useAtom(liveAtomStore)

  useEffect(() => {
    const source = new EventSource(url)
    const sseStream = (source: EventSource) => {
      return Stream.fromEventListener<MessageEvent>(source, "message").pipe(
        Stream.flatMap((message) => Schema.decodeUnknown(PubSubMessage)(JSON.parse(message.data))),
        Stream.mapAccum(Chunk.empty<PubSubMessage>(), (state, message) => [
          Chunk.append(state, message),
          [...state, message],
        ]),
        Stream.catchAll((error) => Stream.die(error))
      )
    }
    const atom = Atom.make(sseStream(source))
    setLiveAtom({ atom })
  }, [url, setLiveAtom])

  return useAtomValue(liveAtom.atom)
}
