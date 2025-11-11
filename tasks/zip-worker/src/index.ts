import { Effect, Layer, Schema } from "effect"
import { ZipWorker } from "./zip-worker"
import { UploadKVRepository } from "@blikka/kv-store"
import { TelemetryLayer } from "@blikka/telemetry"
import { PubSubChannel, PubSubLoggerService, RunStateService } from "@blikka/pubsub"
import { Resource as SSTResource } from "sst"
import { InvalidArgumentsError } from "./utils"

const mainLayer = Layer.mergeAll(
  ZipWorker.Default,
  UploadKVRepository.Default,
  RunStateService.Default,
  PubSubLoggerService.withTaskName("zip-worker"),
  TelemetryLayer("blikka-dev-zip-worker")
)

const getEnvironment = (stage: string): "prod" | "dev" | "staging" => {
  if (stage === "production") return "prod"
  if (stage === "dev" || stage === "development") return "dev"
  return "staging"
}

const parseArguments = Effect.fn("ZipWorker.parseArguments")(
  function* () {
    const domain = yield* Schema.Config("ARG_DOMAIN", Schema.String)
    const reference = yield* Schema.Config("ARG_REFERENCE", Schema.String)
    return { domain, reference }
  },
  Effect.mapError((error) => new InvalidArgumentsError({ cause: error }))
)

const runnable = Effect.gen(function* () {
  const handler = yield* ZipWorker
  const runStateService = yield* RunStateService
  const environment = getEnvironment(SSTResource.App.stage)

  const { domain, reference } = yield* parseArguments()

  const channel = yield* PubSubChannel.fromString(
    `${environment}:upload-flow:${domain}-${reference}`
  )

  yield* runStateService
    .withRunStateEvents("zip-worker", channel, handler.runZipTask(domain, reference), {
      domain,
      reference,
    })
    .pipe(Effect.catchAll((error) => Effect.logError("Error running zip task", error)))
}).pipe(Effect.provide(mainLayer))

Effect.runPromise(runnable)
