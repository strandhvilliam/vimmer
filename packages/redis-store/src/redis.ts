import { Redis } from "@upstash/redis"
import {
  Config,
  ConfigProvider,
  Data,
  Duration,
  Effect,
  Schedule,
} from "effect"

export class RedisError extends Data.TaggedError("RedisError")<{
  message?: string
  cause?: unknown
}> {}

const makeClient = (url: string, token: string) =>
  Effect.gen(function* () {
    const client = new Redis({ url, token })
    yield* Effect.tryPromise({
      try: () => client.ping(),
      catch: (error) =>
        new RedisError({ cause: error, message: "Redis connection failed" }),
    })
    return client
  }).pipe(
    Effect.retry(
      Schedule.exponential(Duration.seconds(1)).pipe(
        Schedule.intersect(Schedule.recurs(5))
      )
    ),
    Effect.tapError((error) =>
      Effect.logError(error.message ?? "Redis connection failed after retries")
    )
  )

export class RedisClient extends Effect.Service<RedisClient>()(
  "@blikka/packages/redis-store/redis-client",
  {
    // No need for scoped since upstash redis is self closing
    effect: Effect.gen(function* () {
      const url = yield* Config.string("REDIS_URL")
      const token = yield* Config.string("REDIS_TOKEN")

      const client = yield* makeClient(url, token)

      const use = <T>(
        fn: (client: Redis) => T
      ): Effect.Effect<Awaited<T>, RedisError, never> =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (error) =>
              new RedisError({
                cause: error,
                message: "Redis.use error (Sync)",
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new RedisError({
                  cause: e,
                  message: "Redis.use error (Async)",
                }),
            })
          } else {
            return result
          }
        })

      return {
        use,
      }
    }),
  }
) {}
