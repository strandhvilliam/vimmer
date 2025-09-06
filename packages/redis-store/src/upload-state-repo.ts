import { Effect, Option, Schema } from "effect"
import { RedisClient } from "./redis"
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

export class UploadStateRepo extends Effect.Service<UploadStateRepo>()(
  "@blikka/packages/redis-store/upload-state-repo",
  {
    dependencies: [
      RedisClient.Default,
      KeyFactory.Default,
      NodeFileSystem.layer,
    ],
    effect: Effect.gen(function* () {
      const redis = yield* RedisClient
      const keyFactory = yield* KeyFactory
      const fs = yield* FileSystem.FileSystem

      const initState = (domain: string, ref: string, expectedCount: number) =>
        Effect.gen(function* () {
          const participantState = makeInitialParticipantState(expectedCount)
          yield* redis.use((client) =>
            client.hset(keyFactory.participant(domain, ref), participantState)
          )

          const submissionStates: Record<string, SubmissionState> = Array.from(
            { length: expectedCount },
            (_, orderIndex) => orderIndex
          ).reduce(
            (acc, orderIndex) => {
              acc[keyFactory.submission(domain, ref, orderIndex.toString())] =
                makeInitialSubmissionState(orderIndex)
              return acc
            },
            {} as Record<string, SubmissionState>
          )

          yield* redis.use((client) => client.mset(submissionStates))
        })

      const getExifState = (domain: string, ref: string, orderIndex: string) =>
        Effect.gen(function* () {
          const key = keyFactory.exif(domain, ref, orderIndex)
          const result = yield* redis.use((client) =>
            client.get<string | null>(key)
          )
          if (result === null) {
            return Option.none<ExifState>()
          }
          const parsed = yield* Schema.decodeUnknown(ExifStateSchema)(result)
          return Option.some<ExifState>(parsed)
        })

      const getParticipantState = (domain: string, ref: string) =>
        Effect.gen(function* () {
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
        })

      const getSubmissionState = (
        domain: string,
        ref: string,
        orderIndex: string
      ) =>
        Effect.gen(function* () {
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
        })

      const incrementParticipantState = (
        domain: string,
        ref: string,
        orderIndex: string
      ) =>
        Effect.gen(function* () {
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
          return yield* Schema.decodeUnknown(IncrementResultSchema)(result)
        })

      const updateParticipantState = (
        domain: string,
        ref: string,
        state: Partial<ParticipantState>
      ) =>
        Effect.gen(function* () {
          const key = keyFactory.participant(domain, ref)
          const encodedState = yield* Schema.encode(
            Schema.partial(ParticipantStateSchema)
          )(state)
          return yield* redis.use((client) => client.hset(key, encodedState))
        })

      const updateSubmissionState = (
        domain: string,
        ref: string,
        orderIndex: string,
        state: Partial<SubmissionState>
      ) =>
        Effect.gen(function* () {
          const key = keyFactory.submission(domain, ref, orderIndex)
          const encodedState = yield* Schema.encode(
            Schema.partial(SubmissionStateSchema)
          )(state)
          return yield* redis.use((client) => client.hset(key, encodedState))
        })

      const setExifState = (
        domain: string,
        ref: string,
        orderIndex: string,
        state: ExifState
      ) =>
        Effect.gen(function* () {
          const key = keyFactory.exif(domain, ref, orderIndex)
          const encodedState = yield* Schema.encode(
            Schema.partial(ExifStateSchema)
          )(state)
          return yield* redis.use((client) => client.set(key, encodedState))
        })

      return {
        getExifState,
        getParticipantState,
        getSubmissionState,
        initState,
        incrementParticipantState,
        updateParticipantState,
        updateSubmissionState,
        setExifState,
      } as const
    }),
  }
) {}
