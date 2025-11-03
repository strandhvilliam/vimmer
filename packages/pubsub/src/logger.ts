import { Console, Effect, Layer, Logger, Schema, Config, ConfigProvider } from "effect"
import { PubSubService } from "./service"
import { PubSubChannel, PubSubMessage } from "./schema"

export class PubSubLoggerService extends Effect.Service<PubSubLoggerService>()(
  "@blikka/pubsub/logger",
  {
    dependencies: [PubSubService.Default],
    effect: Effect.gen(function* () {
      const pubsub = yield* PubSubService
      const taskName = yield* Config.string("TASK_NAME")

      const streamLogger = Logger.make(({ logLevel, message }) => {
        const timestamp = new Date().toISOString()
        const level = logLevel.label
        const logMessage = `[${timestamp}] ${level}: ${message}`

        return Effect.runFork(
          PubSubChannel.fromString(`dev:logger:${taskName}`).pipe(
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
    }),
  }
) {
  static withTaskName(taskName: string) {
    return Layer.provide(
      this.Default,
      Layer.setConfigProvider(ConfigProvider.fromMap(new Map([["TASK_NAME", taskName]])))
    )
  }
}
