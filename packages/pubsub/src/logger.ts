import { Console, Effect, Layer, Logger } from "effect"
import { PubSubService } from "./service"
import { PubSubChannel, PubSubMessage } from "./schema"

export const PubSubLoggerLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const pubsub = yield* PubSubService

    const streamLogger = Logger.make(({ logLevel, message }) => {
      const timestamp = new Date().toISOString()
      const level = logLevel.label
      const logMessage = `[${timestamp}] ${level}: ${message}`

      return Effect.runFork(
        PubSubChannel.fromString("prod:upload-flow:logger").pipe(
          Effect.flatMap((channel) =>
            PubSubMessage.create(channel, logMessage).pipe(
              Effect.flatMap((message) => pubsub.publish(channel, message))
            )
          )
        )
      ).pipe(Effect.catchAll((error) => Console.error("Failed to publish log message", error)))
    })

    const combinedLogger = Logger.zip(Logger.defaultLogger, streamLogger)
    return Logger.replace(Logger.defaultLogger, combinedLogger)
  })
).pipe(Layer.provide(PubSubService.Default))
