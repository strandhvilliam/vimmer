import { Effect, Schema, Option, Schedule, Duration } from "effect"
import { KeyFactory } from "../key-factory"
import { RedisClient } from "../redis"
import { NodeFileSystem } from "@effect/platform-node"
import { ExifStateSchema, type ExifState } from "../schema"

export class ExifKVRepository extends Effect.Service<ExifKVRepository>()(
  "@blikka/packages/kv-store/exif-kv-repository",
  {
    dependencies: [KeyFactory.Default, RedisClient.Default],
    effect: Effect.gen(function* () {
      const redis = yield* RedisClient
      const keyFactory = yield* KeyFactory

      const getExifState = Effect.fn("ExifKVRepository.getExifState")(
        function* (domain: string, ref: string, orderIndex: string) {
          const key = keyFactory.exif(domain, ref, orderIndex)
          const result = yield* redis.use((client) =>
            client.get<string | null>(key)
          )
          if (result === null) {
            return Option.none<ExifState>()
          }
          const parsed = yield* Schema.decodeUnknown(ExifStateSchema)(result)
          return Option.some<ExifState>(parsed)
        },
        Effect.retryOrElse(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          ),
          () => Effect.succeed(Option.none<ExifState>())
        )
      )

      const getAllExifStates = Effect.fn("ExifKVRepository.getAllExifStates")(
        function* (domain: string, ref: string, orderIndexes: string[]) {
          const sortedOrderIndexes = orderIndexes.sort(
            (a, b) => Number(a) - Number(b)
          )
          const keys = sortedOrderIndexes.map((orderIndex) =>
            keyFactory.exif(domain, ref, orderIndex)
          )
          const data = yield* redis.use((client) => client.mget(keys))
          const parsed = yield* Schema.decodeUnknown(
            Schema.Array(ExifStateSchema)
          )(data)

          const result = sortedOrderIndexes.map((orderIndex, index) => {
            return {
              orderIndex,
              exif: parsed.at(index) ?? {},
            }
          })

          return result
        },
        Effect.retryOrElse(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          ),
          () =>
            Effect.succeed(
              new Array<{
                orderIndex: string
                exif: { readonly [x: string]: unknown }
              }>()
            )
        )
      )

      const setExifState = Effect.fn("ExifKVRepository.setExifState")(
        function* (
          domain: string,
          ref: string,
          orderIndex: string,
          state: ExifState
        ) {
          const key = keyFactory.exif(domain, ref, orderIndex)
          const encodedState = yield* Schema.encode(
            Schema.partial(ExifStateSchema)
          )(state)
          return yield* redis.use((client) => client.set(key, encodedState))
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      return {
        getExifState,
        setExifState,
        getAllExifStates,
      }
    }),
  }
) {}
