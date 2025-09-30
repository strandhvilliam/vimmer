// import { Effect, Option, Layer, Ref, Console } from "effect"
// import { describe, it, expect } from "@effect/vitest"
// import { ZipKVRepository } from "./zip-kv-repository"
// import { KeyFactory } from "../key-factory"
// import { RedisClient, RedisError } from "../redis"

// export const makeTestRedis = Effect.gen(function* () {
//   const store = yield* Ref.make<Map<string, Map<string, string>>>(new Map())

//   return RedisClient.of({
//     _tag: "@blikka/packages/redis-store/redis-client",
//     use: (fn) =>
//       Effect.gen(function* () {
//         const mockClient = {
//           get: (key: string) =>
//             Ref.get(store).pipe(
//               Effect.map((map) => {
//                 const hashMap = map.get(key)
//                 if (!hashMap) return null
//                 return JSON.stringify(Object.fromEntries(hashMap.entries()))
//               })
//             ),

//           hset: (hash: string, data: Record<string, any>) =>
//             Ref.update(store, (map) => {
//               const hashMap = map.get(hash) || new Map()
//               for (const [field, value] of Object.entries(data)) {
//                 hashMap.set(
//                   field,
//                   typeof value === "string" ? value : JSON.stringify(value)
//                 )
//               }
//               map.set(hash, hashMap)
//               return map
//             }).pipe(Effect.asVoid),

//           hincrby: (hash: string, field: string, increment: number) =>
//             Ref.modify(store, (map) => {
//               const hashMap = map.get(hash) || new Map()
//               const currentValue = parseInt(hashMap.get(field) || "0", 10)
//               const newValue = currentValue + increment
//               hashMap.set(field, newValue.toString())
//               map.set(hash, hashMap)
//               return [newValue, map]
//             }),

//           hSet: (hash: string, field: string, value: string) =>
//             Ref.update(store, (map) => {
//               const hashMap = map.get(hash) || new Map()
//               hashMap.set(field, value)
//               map.set(hash, hashMap)
//               return map
//             }).pipe(Effect.asVoid),

//           hgetall: (hash: string) =>
//             Ref.get(store).pipe(
//               Effect.map((map) => {
//                 const hashMap = map.get(hash)
//                 if (!hashMap || hashMap.size === 0) return null
//                 return Object.fromEntries(hashMap.entries())
//               })
//             ),

//           hMSet: (hash: string, data: Record<string, any>) =>
//             Ref.update(store, (map) => {
//               const hashMap = map.get(hash) || new Map()
//               for (const [field, value] of Object.entries(data)) {
//                 hashMap.set(
//                   field,
//                   typeof value === "string" ? value : JSON.stringify(value)
//                 )
//               }
//               map.set(hash, hashMap)
//               return map
//             }).pipe(Effect.asVoid),

//           flushAll: () => Ref.set(store, new Map()).pipe(Effect.asVoid),

//           quit: () => Effect.void,
//         } as any

//         const result = yield* Effect.try({
//           try: () => fn(mockClient),
//           catch: (e) =>
//             new RedisError({
//               cause: e,
//               message: "Synchronous error in `Redis.use`",
//             }),
//         })

//         if (result instanceof Promise) {
//           return yield* Effect.tryPromise({
//             try: () => result,
//             catch: (e) =>
//               new RedisError({
//                 cause: e,
//                 message: "Asynchronous error in `Redis.use`",
//               }),
//           })
//         }
//         return result
//       }),
//   })
// })

// const redisMockLayer = Layer.scoped(RedisClient, makeTestRedis)

// const testLayers = ZipKVRepository.DefaultWithoutDependencies.pipe(
//   Layer.provide(Layer.mergeAll(redisMockLayer, KeyFactory.Default))
// )

// describe("ZipKVRepository", () => {
//   it.effect("initializeZipProgress creates initial zip progress", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       yield* repo.initializeZipProgress(
//         "event-1",
//         "participant-1",
//         "test-zip-key"
//       )

//       const result = yield* repo.getZipProgress("event-1", "participant-1")

//       expect(Option.isSome(result)).toBe(true)
//     }).pipe(Effect.provide(testLayers))
//   )

//   it.effect("getZipProgress returns None when no progress exists", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       const result = yield* repo.getZipProgress("event-1", "participant-1")
//       console.log("////////////////")
//       console.log(Option.isNone(result) ? "true" : result.value)
//       console.log("////////////////")

//       expect(Option.isNone(result)).toBe(true)
//     }).pipe(Effect.provide(testLayers))
//   )

//   it.effect("getZipProgress returns Some when progress exists", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       yield* repo.initializeZipProgress(
//         "event-1",
//         "participant-1",
//         "test-zip-key"
//       )

//       const result = yield* repo.getZipProgress("event-1", "participant-1")

//       expect(Option.isSome(result)).toBe(true)
//     }).pipe(Effect.provide(testLayers))
//   )

//   it.effect("incrementZipProgress increases progress count", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       yield* repo.initializeZipProgress(
//         "event-1",
//         "participant-1",
//         "test-zip-key"
//       )

//       const newValue = yield* repo.incrementZipProgress(
//         "event-1",
//         "participant-1"
//       )
//       expect(newValue).toBe(1)

//       const newValue2 = yield* repo.incrementZipProgress(
//         "event-1",
//         "participant-1"
//       )
//       expect(newValue2).toBe(2)

//       const newValue3 = yield* repo.incrementZipProgress(
//         "event-1",
//         "participant-1"
//       )
//       expect(newValue3).toBe(3)
//     }).pipe(Effect.provide(testLayers))
//   )

//   it.effect("completeZipProgress sets status to completed", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       yield* repo.initializeZipProgress(
//         "event-1",
//         "participant-1",
//         "test-zip-key"
//       )

//       yield* repo.completeZipProgress("event-1", "participant-1")

//       const result = yield* repo.getZipProgress("event-1", "participant-1")

//       expect(Option.isSome(result)).toBe(true)
//     }).pipe(Effect.provide(testLayers))
//   )

//   it.effect("setZipProgressError sets errors", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       yield* repo.initializeZipProgress(
//         "event-1",
//         "participant-1",
//         "test-zip-key"
//       )

//       yield* repo.setZipProgressError("event-1", "participant-1", [
//         "Error 1",
//         "Error 2",
//       ])

//       const result = yield* repo.getZipProgress("event-1", "participant-1")

//       expect(Option.isSome(result)).toBe(true)
//     }).pipe(Effect.provide(testLayers))
//   )

//   it.effect("incrementZipProgress on non-existent hash creates it", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       const newValue = yield* repo.incrementZipProgress(
//         "event-1",
//         "participant-1"
//       )

//       expect(newValue).toBe(1)
//     }).pipe(Effect.provide(testLayers))
//   )

//   it.effect("multiple operations on same key maintain correct state", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       yield* repo.initializeZipProgress(
//         "event-1",
//         "participant-1",
//         "test-zip-key"
//       )

//       yield* repo.incrementZipProgress("event-1", "participant-1")
//       yield* repo.incrementZipProgress("event-1", "participant-1")

//       const countAfterIncrements = yield* repo.incrementZipProgress(
//         "event-1",
//         "participant-1"
//       )
//       expect(countAfterIncrements).toBe(3)

//       yield* repo.setZipProgressError("event-1", "participant-1", [
//         "Test error",
//       ])

//       yield* repo.completeZipProgress("event-1", "participant-1")

//       const result = yield* repo.getZipProgress("event-1", "participant-1")
//       expect(Option.isSome(result)).toBe(true)
//     }).pipe(Effect.provide(testLayers))
//   )

//   it.effect("operations on different keys are isolated", () =>
//     Effect.gen(function* () {
//       const repo = yield* ZipKVRepository

//       yield* repo.initializeZipProgress("event-1", "participant-1", "key-1")
//       yield* repo.initializeZipProgress("event-1", "participant-2", "key-2")

//       yield* repo.incrementZipProgress("event-1", "participant-1")
//       yield* repo.incrementZipProgress("event-1", "participant-1")

//       const count1 = yield* repo.incrementZipProgress(
//         "event-1",
//         "participant-1"
//       )
//       expect(count1).toBe(3)

//       const count2 = yield* repo.incrementZipProgress(
//         "event-1",
//         "participant-2"
//       )
//       expect(count2).toBe(1)
//     }).pipe(Effect.provide(testLayers))
//   )
// })
