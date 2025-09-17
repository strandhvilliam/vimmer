import { Effect, Option, Schedule, Duration } from "effect"
import { KeyFactory } from "./key-factory"
import { RedisClient } from "./redis"

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
          return yield* redis.use((client) => client.incr(key))
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const resetZipProgress = Effect.fn("ZipKVRepository.resetZipProgress")(
        function* (domain: string, ref: string) {
          const key = keyFactory.zipProgress(domain, ref)
          return yield* redis.use((client) => client.del(key))
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
      } as const
    }),
  }
) {}
