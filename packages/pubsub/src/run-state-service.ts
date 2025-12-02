import { Effect, Config, Console, Schema } from "effect"
import { PubSubService } from "./pubsub-service"
import { PubSubChannel, PubSubMessage } from "./schema"

export const RunStateEventSchema = Schema.Struct({
  domain: Schema.NullOr(Schema.String),
  reference: Schema.NullOr(Schema.String),
  orderIndex: Schema.NullOr(Schema.Number),
  state: Schema.Literal("start", "end", "once"),
  taskName: Schema.String,
  timestamp: Schema.Number,
  error: Schema.NullOr(Schema.String),
  duration: Schema.NullOr(Schema.Number),
})

export type RunStateEvent = Schema.Schema.Type<typeof RunStateEventSchema>

export class RunStateService extends Effect.Service<RunStateService>()(
  "@blikka/pubsub/run-state-service",
  {
    dependencies: [PubSubService.Default],
    effect: Effect.gen(function* () {
      const pubsub = yield* PubSubService

      const sendRunStateEvent = Effect.fn("RunStateService.sendRunStateEvent")(function* (
        taskName: string,
        channel: PubSubChannel,
        state: "start" | "end" | "once",
        metadata?: {
          domain?: string
          reference?: string
          orderIndex?: number
          error?: string
          duration?: number
        }
      ) {
        const message = yield* PubSubMessage.create(
          channel,
          {
            state,
            taskName,
            domain: metadata?.domain ?? null,
            reference: metadata?.reference ?? null,
            orderIndex: metadata?.orderIndex ?? null,
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

      const withRunStateEvents = <E, A, R>({
        taskName,
        channel,
        effect,
        metadata,
      }: {
        taskName: string
        channel: PubSubChannel
        effect: Effect.Effect<A, E, R>
        metadata?: {
          domain?: string
          reference?: string
          orderIndex?: number
        }
      }) =>
        Effect.gen(function* () {
          const startTime = Date.now()
          yield* sendRunStateEvent(taskName, channel, "start", metadata)

          return yield* effect.pipe(
            Effect.tapError((error) =>
              Effect.gen(function* () {
                const duration = Date.now() - startTime
                yield* sendRunStateEvent(taskName, channel, "end", {
                  ...metadata,
                  error: error instanceof Error ? error.message : String(error),
                  duration,
                }).pipe(Effect.catchAll(Effect.logError))
                return yield* Effect.fail(error)
              })
            ),
            Effect.tap((result) =>
              Effect.gen(function* () {
                const duration = Date.now() - startTime
                yield* sendRunStateEvent(taskName, channel, "end", {
                  ...metadata,
                  duration,
                }).pipe(Effect.catchAll(Effect.logError))
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
