import { Effect, Config, Console, Schema } from "effect"
import { PubSubService } from "./service"
import { PubSubChannel, PubSubMessage } from "./schema"

export const RunStateEventSchema = Schema.Struct({
  state: Schema.Literal("start", "end"),
  taskName: Schema.String,
  timestamp: Schema.Number,
  error: Schema.NullOr(Schema.String),
  duration: Schema.NullOr(Schema.Number),
})

export class RunStateService extends Effect.Service<RunStateService>()(
  "@blikka/pubsub/run-state-service",
  {
    dependencies: [PubSubService.Default],
    effect: Effect.gen(function* () {
      const pubsub = yield* PubSubService

      const sendRunStateEvent = Effect.fn("RunStateService.sendRunStateEvent")(function* (
        taskName: string,
        channel: PubSubChannel,
        state: "start" | "end",
        metadata?: {
          error?: string
          duration?: number
        }
      ) {
        const message = yield* PubSubMessage.create(
          channel,
          {
            state,
            taskName,
            timestamp: Date.now(),
            error: metadata?.error ?? null,
            duration: metadata?.duration ?? null,
          },
          RunStateEventSchema
        )

        return yield* pubsub
          .publish(channel, message)
          .pipe(
            Effect.catchAll((error) => Effect.logError(`Failed to publish ${state} event`, error))
          )
      })

      const withRunStateEvents = <E, A, R>(
        taskName: string,
        channel: PubSubChannel,
        effect: Effect.Effect<A, E, R>
      ) =>
        Effect.gen(function* () {
          const startTime = Date.now()

          yield* sendRunStateEvent(taskName, channel, "start")

          return yield* effect.pipe(
            Effect.tapError((error) =>
              Effect.gen(function* () {
                const duration = Date.now() - startTime
                yield* sendRunStateEvent(taskName, channel, "end", {
                  error: error instanceof Error ? error.message : String(error),
                  duration,
                }).pipe(Effect.catchAll(Effect.logError))
                return yield* Effect.fail(error)
              })
            ),
            Effect.tap((result) =>
              Effect.gen(function* () {
                const duration = Date.now() - startTime
                yield* sendRunStateEvent(taskName, channel, "end", { duration }).pipe(
                  Effect.catchAll(Effect.logError)
                )
                return yield* Effect.succeed(result)
              })
            )
          )
        })

      return {
        sendRunStateEvent,
        withRunStateEvents,
      } as const
    }),
  }
) {}
