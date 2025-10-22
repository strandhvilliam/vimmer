import { Effect, Layer } from "effect"
import { ZipWorker } from "./zip-worker"
import { UploadKVRepository } from "@blikka/kv-store"
import { TelemetryLayer } from "@blikka/telemetry"

const mainLayer = Layer.mergeAll(
  ZipWorker.Default,
  UploadKVRepository.Default,
  TelemetryLayer("blikka-dev-zip-worker")
)

const runnable = Effect.gen(function* () {
  const handler = yield* ZipWorker

  yield* handler
    .runZipTask()
    .pipe(Effect.catchAll((error) => Effect.logError("Error running zip task", error)))
}).pipe(Effect.provide(mainLayer))

Effect.runPromise(runnable)
