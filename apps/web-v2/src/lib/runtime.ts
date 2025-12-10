import { Layer, ManagedRuntime, Effect, Cause, Exit, Chunk, ConfigError } from "effect"
import { DrizzleClient, Database } from "@blikka/db"
import { EmailService } from "@blikka/email"
import { AuthLayer } from "./auth/server"
import { NodeContext } from "@effect/platform-node"
import { TRPCClient } from "./trpc/effect-client"

// Helper to convert ConfigError to a defect in a layer
const catchConfigError = <A, E, R>(layer: Layer.Layer<A, E, R>) =>
  layer.pipe(
    Layer.catchAll((error) => {
      if (ConfigError.isConfigError(error)) {
        return Layer.die(error)
      }
      return Layer.fail(error)
    })
  )

const MainLayer = Layer.mergeAll(
  DrizzleClient.Default,
  Database.Default,
  EmailService.Default,
  AuthLayer,
  TRPCClient.Default
).pipe(
  Layer.provide(NodeContext.layer),
  Layer.catchAll((error) => {
    if (ConfigError.isConfigError(error)) {
      console.error("ConfigError", error)
      return Layer.die(error)
    }
    return Layer.fail(error)
  })
)

export const serverRuntime = ManagedRuntime.make(MainLayer)

export type RuntimeDependencies = ManagedRuntime.ManagedRuntime.Context<typeof serverRuntime>
