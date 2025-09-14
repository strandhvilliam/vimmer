import { Duration, Effect, Option, Schedule, Schema } from "effect"
import { RedisClient, RedisError } from "./redis"
import { NodeFileSystem } from "@effect/platform-node"
import { KeyFactory } from "./key-factory"
import {
  ExifStateSchema,
  IncrementResultSchema,
  makeInitialParticipantState,
  makeInitialSubmissionState,
  ParticipantStateSchema,
  SubmissionStateSchema,
  type ExifState,
  type ParticipantState,
  type SubmissionState,
} from "./schema"
import { FileSystem } from "@effect/platform"

export class UploadKVRepository extends Effect.Service<UploadKVRepository>()(
  "@blikka/packages/kv-store/upload-kv-repository",
  {
    dependencies: [
      NodeFileSystem.layer,
      RedisClient.Default,
      KeyFactory.Default,
    ],
    effect: Effect.gen(function* () {
      const redis = yield* RedisClient
      const keyFactory = yield* KeyFactory
      const fs = yield* FileSystem.FileSystem

      const initState = Effect.fn("UploadKVRepository.initState")(
        function* (domain: string, ref: string, expectedCount: number) {
          const participantState = makeInitialParticipantState(expectedCount)

          const submissionStates = Array.from(
            { length: expectedCount },
            (_, orderIndex) => orderIndex
          ).reduce<Record<string, SubmissionState>>((acc, orderIndex) => {
            const key = keyFactory.submission(
              domain,
              ref,
              orderIndex.toString()
            )
            acc[key] = makeInitialSubmissionState(orderIndex)
            return acc
          }, {})

          yield* redis.use((client) => client.mset(submissionStates))
          yield* redis.use((client) =>
            client.hset(keyFactory.participant(domain, ref), participantState)
          )
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const setParticipantErrorState = Effect.fn(
        "UploadKVRepository.setErrorState"
      )(
        function* (domain: string, ref: string, code: string) {
          const participantState = yield* getParticipantState(domain, ref)
          if (Option.isSome(participantState)) {
            yield* updateParticipantState(domain, ref, {
              errors: [...participantState.value.errors, code],
            })
          }
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const incrementParticipantState = Effect.fn(
        "UploadKVRepository.incrementParticipantState"
      )(
        function* (domain: string, ref: string, orderIndex: string) {
          const key = keyFactory.participant(domain, ref)
          const incrementScript = yield* fs.readFileString(
            "lua-scripts/increment.lua"
          )
          const [result] = yield* redis.use((client) =>
            client.eval<string[], [string]>(
              incrementScript,
              [key],
              [orderIndex]
            )
          )
          const code = yield* Schema.decodeUnknown(IncrementResultSchema)(
            result
          )

          switch (code) {
            case "INVALID_ORDER_INDEX":
              yield* setParticipantErrorState(domain, ref, code)
              return yield* Effect.fail(
                new RedisError({
                  message: "Invalid order index provided",
                  cause: result,
                })
              )
              break
            case "MISSING_DATA":
              yield* setParticipantErrorState(domain, ref, code)
              return yield* Effect.fail(
                new RedisError({
                  message: "Missing data provided",
                  cause: result,
                })
              )
              break
            case "DUPLICATE_ORDER_INDEX":
              yield* Effect.logWarning(
                "Duplicate order index provided, skipping"
              )
              break
            case "ALREADY_FINALIZED":
              yield* Effect.logWarning("Already finalized, skipping")
              break
          }

          return { finalize: code === "FINALIZED" }
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const getExifState = Effect.fn("UploadKVRepository.getExifState")(
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

      const getParticipantState = Effect.fn(
        "UploadKVRepository.getParticipantState"
      )(
        function* (domain: string, ref: string) {
          const key = keyFactory.participant(domain, ref)
          const result = yield* redis.use((client) =>
            client.get<string | null>(key)
          )
          if (result === null) {
            return Option.none<ParticipantState>()
          }
          const parsed = yield* Schema.decodeUnknown(ParticipantStateSchema)(
            result
          )
          return Option.some<ParticipantState>(parsed)
        },
        Effect.retryOrElse(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          ),
          () => Effect.succeed(Option.none<ParticipantState>())
        )
      )

      const getSubmissionState = Effect.fn(
        "UploadKVRepository.getSubmissionState"
      )(
        function* (domain: string, ref: string, orderIndex: string) {
          const key = keyFactory.submission(domain, ref, orderIndex)
          const result = yield* redis.use((client) =>
            client.get<string | null>(key)
          )
          if (result === null) {
            return Option.none<SubmissionState>()
          }
          const parsed = yield* Schema.decodeUnknown(SubmissionStateSchema)(
            result
          )
          return Option.some<SubmissionState>(parsed)
        },
        Effect.retryOrElse(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          ),
          () => Effect.succeed(Option.none<SubmissionState>())
        )
      )

      const getAllSubmissionStates = Effect.fn(
        "UploadKVRepository.getAllSubmissionStates"
      )(
        function* (domain: string, ref: string, orderIndexes: string[]) {
          const keys = orderIndexes.map((orderIndex) =>
            keyFactory.submission(domain, ref, orderIndex)
          )

          const result = yield* redis.use((client) => client.mget(keys))

          const parsed = yield* Schema.decodeUnknown(
            Schema.Array(SubmissionStateSchema)
          )(result)

          return Option.some(parsed)
        },
        Effect.retryOrElse(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          ),
          () => Effect.succeed(Option.none<SubmissionState[]>())
        )
      )

      const getAllExifStates = Effect.fn("UploadKVRepository.getAllExifStates")(
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
              exif: parsed.at(index),
            }
          })

          return Option.some(result)
        },
        Effect.retryOrElse(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          ),
          () =>
            Effect.succeed(
              Option.none<{ orderIndex: string; exif: ExifState }[]>()
            )
        )
      )

      const updateParticipantState = Effect.fn(
        "UploadKVRepository.updateParticipantState"
      )(
        function* (
          domain: string,
          ref: string,
          state: Partial<ParticipantState>
        ) {
          const key = keyFactory.participant(domain, ref)
          const encodedState = yield* Schema.encode(
            Schema.partial(ParticipantStateSchema)
          )(state)
          return yield* redis.use((client) => client.hset(key, encodedState))
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const updateSubmissionState = Effect.fn(
        "UploadKVRepository.updateSubmissionState"
      )(
        function* (
          domain: string,
          ref: string,
          orderIndex: string,
          state: Partial<SubmissionState>
        ) {
          const key = keyFactory.submission(domain, ref, orderIndex)
          const encodedState = yield* Schema.encode(
            Schema.partial(SubmissionStateSchema)
          )(state)
          return yield* redis.use((client) => client.hset(key, encodedState))
        },
        Effect.retry(
          Schedule.compose(
            Schedule.exponential(Duration.millis(100)),
            Schedule.recurs(3)
          )
        )
      )

      const setExifState = Effect.fn("UploadKVRepository.setExifState")(
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
        getParticipantState,
        getSubmissionState,
        getAllSubmissionStates,
        initState,
        incrementParticipantState,
        setParticipantErrorState,
        updateParticipantState,
        updateSubmissionState,
        setExifState,
        getAllExifStates,
      } as const
    }),
  }
) {}
