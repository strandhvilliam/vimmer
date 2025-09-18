import { Effect, Layer } from "effect"
import { ZipWorker } from "./zip-worker"
import { UploadKVRepository } from "@blikka/kv-store"

const mainLayer = Layer.mergeAll(ZipWorker.Default, UploadKVRepository.Default)

const runnable = Effect.gen(function* () {
  const handler = yield* ZipWorker

  yield* handler
    .runZipTask()
    .pipe(
      Effect.catchAll((error) =>
        Effect.logError("Error running zip task", error)
      )
    )
}).pipe(Effect.provide(mainLayer))

Effect.runPromise(runnable)
