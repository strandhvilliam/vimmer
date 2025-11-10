"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card"
import { ScrollArea } from "@vimmer/ui/components/scroll-area"
import { Atom, Result, useAtom, useAtomMount, useAtomValue } from "@effect-atom/atom-react"
import { Chunk, Effect, Schema, Stream, Schedule, Console } from "effect"
import { PubSubMessage } from "@blikka/pubsub"
import { useEffect, useState } from "react"
import { useMounted } from "app/hooks/use-mounted"

class SseListener extends Effect.Service<SseListener>()("@blikka/observer/sse-listener", {
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

    return {
      createStream,
    }
  }),
}) {}

const sseListenerRuntime = Atom.runtime(SseListener.Default)

const sseStreamAtom = Atom.family((url: string) =>
  sseListenerRuntime.atom(() =>
    Stream.unwrap(
      Effect.gen(function* () {
        const sseStream = yield* SseListener
        return yield* sseStream.createStream(url)
      })
    )
  )
)

export function LogsPanel() {
  const result = useAtomValue(sseStreamAtom("/api/subscribe?channel=dev:logger:*"))
  const mounted = useMounted()

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-semibold">Logs</CardTitle>
        <CardDescription>Streamed output from dev:logger:*</CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto flex-1">
        <ScrollArea className="h-full">
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
            {!mounted
              ? "Loading..."
              : Result.match(result, {
                  onInitial: () => "Waiting for logs...",
                  onFailure: () => "Error",
                  onSuccess: (result) => result.value.map((message) => message.payload).join("\n"),
                })}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
