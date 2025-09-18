import { Effect } from "effect"
import { ZipWorker } from "./zip-worker"

const runnable = Effect.gen(function* () {
  const handler = yield* ZipWorker
  yield* handler
    .runZipTask()
    .pipe(
      Effect.catchAll((error) =>
        Effect.logError("Error running zip task", error)
      )
    )
}).pipe(Effect.provide(ZipWorker.Default))

Effect.runPromise(runnable)
