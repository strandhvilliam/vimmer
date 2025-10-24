import { Duration, Effect, HashMap, Option, pipe, Schedule, Schema } from "effect"
import { RedisClient, RedisError } from "@blikka/redis"
import { NodeFileSystem } from "@effect/platform-node"
import { KeyFactory } from "../key-factory"
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
} from "../schema"
import { FileSystem } from "@effect/platform"
import { parseKey } from "../utils"
import { luaIncrement } from "../lua-scripts/lua-increment"

export class UploadKVRepository extends Effect.Service<UploadKVRepository>()(
  "@blikka/packages/kv-store/upload-kv-repository",
  {
    dependencies: [NodeFileSystem.layer, RedisClient.Default, KeyFactory.Default],
    effect: Effect.gen(function* () {
      const redis = yield* RedisClient
      const keyFactory = yield* KeyFactory
      const fs = yield* FileSystem.FileSystem

      const initializeState = Effect.fn("UploadKVRepository.initState")(
        function* (domain: string, reference: string, submissionKeys: string[]) {
          const participantState = makeInitialParticipantState(submissionKeys.length)

          const map: Record<string, SubmissionState> = {}

          for (const key of submissionKeys) {
            const { orderIndex } = yield* parseKey(key)
            const formattedOrderIndex = (orderIndex + 1).toString().padStart(2, "0")
            const redisKey = keyFactory.submission(domain, reference, formattedOrderIndex)
            map[redisKey] = makeInitialSubmissionState(key, orderIndex)
          }

          yield* redis.use((client) => {
            const participantKey = keyFactory.participant(domain, reference)
            const entries = Object.entries(map)

            const multi = entries.reduce(
              (chain, [redisKey, value]) => chain.hset(redisKey, value),
              client.multi().hset(participantKey, participantState)
            )
            return multi.exec()
          })
        },
        Effect.retry(
          Schedule.compose(Schedule.exponential(Duration.millis(100)), Schedule.recurs(3))
        )
      )

      const setParticipantErrorState = Effect.fn("UploadKVRepository.setErrorState")(
        function* (domain: string, ref: string, code: string) {
          const participantState = yield* getParticipantState(domain, ref)
          if (Option.isSome(participantState)) {
            yield* updateParticipantState(domain, ref, {
              errors: [...participantState.value.errors, code],
            })
          }
        },
        Effect.retry(
          Schedule.compose(Schedule.exponential(Duration.millis(100)), Schedule.recurs(3))
        )
      )

      const incrementParticipantState = Effect.fn("UploadKVRepository.incrementParticipantState")(
        function* (domain: string, ref: string, orderIndex: number) {
          const key = keyFactory.participant(domain, ref)
          const incrementScript = luaIncrement
          const [result] = yield* redis
            .use((client) =>
              client.eval<string[], [string]>(incrementScript, [key], [orderIndex.toString()])
            )
            .pipe(
              Effect.mapError((error) => {
                console.log("FFFFFFFFFFFFFFff", error)
                return new RedisError({
                  message: "Failed to increment participant state",
                  cause: error.cause,
                })
              })
            )
          const code = yield* Schema.decodeUnknown(IncrementResultSchema)(result)

          switch (code) {
            case "INVALID_ORDER_INDEX":
              yield* setParticipantErrorState(domain, ref, code)
              return yield* new RedisError({
                message: "Invalid order index provided",
                cause: result,
              })
              break
            case "MISSING_DATA":
              yield* setParticipantErrorState(domain, ref, code)
              return yield* new RedisError({
                message: "Missing data provided",
                cause: result,
              })
              break
            case "DUPLICATE_ORDER_INDEX":
              yield* Effect.logWarning("Duplicate order index provided, skipping")
              break
            case "ALREADY_FINALIZED":
              yield* Effect.logWarning("Already finalized, skipping")
              break
          }

          return { finalize: code === "FINALIZED" }
        }
      )

      const getParticipantState = Effect.fn("UploadKVRepository.getParticipantState")(function* (
        domain: string,
        ref: string
      ) {
        const key = keyFactory.participant(domain, ref)
        const result = yield* redis.use((client) => client.hgetall(key))

        if (result === null) {
          return Option.none<ParticipantState>()
        }
        const parsed = yield* Schema.decodeUnknown(ParticipantStateSchema)(result)
        return Option.some<ParticipantState>(parsed)
      })

      const getSubmissionState = Effect.fn("UploadKVRepository.getSubmissionState")(function* (
        domain: string,
        ref: string,
        orderIndex: number
      ) {
        const formattedOrderIndex = (Number(orderIndex) + 1).toString().padStart(2, "0")
        const key = keyFactory.submission(domain, ref, formattedOrderIndex)
        const result = yield* redis.use((client) => client.hgetall(key))
        if (result === null) {
          return Option.none<SubmissionState>()
        }
        const parsed = yield* Schema.decodeUnknown(SubmissionStateSchema)(result)
        return Option.some<SubmissionState>(parsed)
      })

      const getAllSubmissionStates = Effect.fn("UploadKVRepository.getAllSubmissionStates")(
        function* (domain: string, ref: string, orderIndexes: number[]) {
          const formattedOrderIndexes = orderIndexes.map((orderIndex) =>
            (Number(orderIndex) + 1).toString().padStart(2, "0")
          )
          const keys = formattedOrderIndexes.map((formattedOrderIndex) =>
            keyFactory.submission(domain, ref, formattedOrderIndex)
          )

          const result = yield* redis.use((client) => {
            const multi = keys.reduce((chain, redisKey) => chain.hgetall(redisKey), client.multi())
            return multi.exec<([string, Record<string, unknown>] | null)[]>()
          })

          const parsed = yield* Schema.decodeUnknown(Schema.Array(SubmissionStateSchema))(result)

          return parsed
        }
      )

      const updateParticipantState = Effect.fn("UploadKVRepository.updateParticipantState")(
        function* (domain: string, ref: string, state: Partial<ParticipantState>) {
          const key = keyFactory.participant(domain, ref)
          const encodedState = yield* Schema.encode(Schema.partial(ParticipantStateSchema))(state)
          return yield* redis.use((client) => client.hset(key, encodedState))
        }
      )

      const updateSubmissionState = Effect.fn("UploadKVRepository.updateSubmissionState")(
        function* (
          domain: string,
          ref: string,
          orderIndex: number,
          state: Partial<SubmissionState>
        ) {
          const formattedOrderIndex = (Number(orderIndex) + 1).toString().padStart(2, "0")
          const key = keyFactory.submission(domain, ref, formattedOrderIndex)
          const encodedState = yield* Schema.encode(Schema.partial(SubmissionStateSchema))(state)
          return yield* redis.use((client) => client.hset(key, encodedState))
        }
      )

      return {
        getParticipantState,
        getSubmissionState,
        getAllSubmissionStates,
        initializeState,
        incrementParticipantState,
        setParticipantErrorState,
        updateParticipantState,
        updateSubmissionState,
      } as const
    }),
  }
) {}
