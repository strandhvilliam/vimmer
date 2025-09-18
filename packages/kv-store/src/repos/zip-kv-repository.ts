import { Effect, Option, Schedule, Duration, Schema } from "effect"
import { KeyFactory } from "../key-factory"
import { RedisClient } from "../redis"
import { makeInitialZipProgress } from "../schema"

export class ZipKVRepository extends Effect.Service<ZipKVRepository>()(
  "@blikka/packages/kv-store/zip-kv-repository",
  {
    dependencies: [RedisClient.Default, KeyFactory.Default],
    effect: Effect.gen(function* () {
      const redis = yield* RedisClient
      const keyFactory = yield* KeyFactory

      const getZipProgress = Effect.fn("ZipKVRepository.getZipProgress")(
        function* (domain: string, ref: string) {
          const key = keyFactory.zipProgress(domain, ref)
          const result = yield* redis.use((client) =>
            client.get<string | null>(key)
          )
          return result
        },
        Effect.retryOrElse(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          ),
          () => Effect.succeed(Option.none<string | null>())
        )
      )

      const incrementZipProgress = Effect.fn(
        "ZipKVRepository.updateZipProgress"
      )(
        function* (domain: string, ref: string) {
          const key = keyFactory.zipProgress(domain, ref)
          return yield* redis.use((client) =>
            client.hincrby(key, "progress", 1)
          )
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const completeZipProgress = Effect.fn(
        "ZipKVRepository.completeZipProgress"
      )(
        function* (domain: string, ref: string) {
          const key = keyFactory.zipProgress(domain, ref)
          return yield* redis.use((client) =>
            client.hset(key, { status: "completed" })
          )
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const setZipProgressError = Effect.fn(
        "ZipKVRepository.setZipProgressError"
      )(
        function* (domain: string, ref: string, errors: string[]) {
          const key = keyFactory.zipProgress(domain, ref)
          return yield* redis.use((client) => client.hset(key, { errors }))
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const initializeZipProgress = Effect.fn(
        "ZipKVRepository.resetZipProgress"
      )(
        function* (domain: string, ref: string, zipKey: string) {
          const key = keyFactory.zipProgress(domain, ref)
          return yield* redis.use((client) =>
            client.hset(key, makeInitialZipProgress(zipKey))
          )
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      return {
        getZipProgress,
        incrementZipProgress,
        setZipProgressError,
        initializeZipProgress,
        completeZipProgress,
      } as const
    }),
  }
) {}
