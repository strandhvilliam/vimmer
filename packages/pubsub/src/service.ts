import { Chunk, Data, Duration, Effect, Queue, Schedule, Schema, Stream } from "effect"
import { RedisClient, RedisError } from "@blikka/redis"
import { PubSubChannel } from "./schema"
import { ChannelParseError, PubSubError } from "./utils"

export class PubSubService extends Effect.Service<PubSubService>()(
  "@blikka/pubsub/pubsub-service",
  {
    dependencies: [RedisClient.Default],
    effect: Effect.gen(function* () {
      const redis = yield* RedisClient

      const publish = Effect.fn("PubSubService.publish")(
        function* (channel: PubSubChannel, message: string) {
          const channelString = yield* PubSubChannel.toString(channel)
          return yield* redis.use((client) => client.publish(channelString, message))
        },
        Effect.retry(
          Schedule.compose(Schedule.exponential(Duration.millis(100)), Schedule.recurs(3))
        ),
        Effect.mapError(
          (error) => new PubSubError({ cause: error, message: "Failed to publish message" })
        )
      )

      const subscribe = (channel: PubSubChannel) =>
        Stream.asyncPush<string, ChannelParseError | PubSubError | RedisError, never>(
          Effect.fnUntraced(function* (emit) {
            const channelString = yield* PubSubChannel.toString(channel)

            const subscription = yield* Effect.acquireRelease(
              redis.use((client) => client.subscribe<string>(channelString)),
              (subscription) =>
                Effect.tryPromise({
                  try: () => subscription.unsubscribe(),
                  catch: (error) =>
                    new RedisError({
                      cause: error,
                      message: "Failed to unsubscribe from channel",
                    }),
                }).pipe(
                  Effect.catchAll((error) =>
                    Effect.logError("Failed to unsubscribe from channel", error)
                  )
                )
            )

            subscription.on("message", (data) => emit.single(data.message))
            subscription.on("error", (error) =>
              emit.fail(
                new PubSubError({ cause: error, message: "Failed to subscribe to channel" })
              )
            )

            // yield* Effect.addFinalizer(() =>
            //   Effect.tryPromise({
            //     try: () => subscription.unsubscribe(),
            //     catch: (error) =>
            //       new RedisError({
            //         cause: error,
            //         message: "Failed to unsubscribe from channel",
            //       }),
            //   }).pipe(
            //     Effect.catchAll((error) =>
            //       Effect.logError("Failed to unsubscribe from channel", error)
            //     )
            //   )
            // )
          })
        )

      return {
        publish,
        subscribe,
      } as const
    }),
  }
) {}
