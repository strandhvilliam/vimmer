import { Console, Effect, Layer, Logger, Runtime } from "effect"
import { PubSubService } from "./service"
import { PubSubChannel, PubSubMessage } from "./schema"

export const makePubSubLogger = (taskName: string) =>
  Layer.unwrapEffect(
    Effect.gen(function* () {
      const pubsub = yield* PubSubService

      const streamLogger = Logger.make(({ logLevel, message }) => {
        const timestamp = new Date().toISOString()
        const level = logLevel.label
        const logMessage = `[${timestamp}] ${level}: ${message}`

        Effect.runFork(
          Effect.gen(function* () {
            const channel = yield* PubSubChannel.fromString(`dev:logger:${taskName}`)
            const msg = yield* PubSubMessage.create(channel, logMessage)
            const result = yield* pubsub.publish(channel, msg)
            return result
          }).pipe(
            Effect.catchAll((error) => {
              return Console.error("Failed to publish log message", error)
            })
          )
        )
      })

      const combinedLogger = Logger.zip(Logger.defaultLogger, streamLogger)
      return Logger.replace(Logger.defaultLogger, combinedLogger)
    })
  ).pipe(Layer.provide(PubSubService.Default))

export class PubSubLoggerService extends Effect.Service<PubSubLoggerService>()(
  "@blikka/pubsub/logger",
  {
    effect: Effect.succeed({}),
  }
) {
  static withTaskName(taskName: string) {
    return makePubSubLogger(taskName)
  }
}
