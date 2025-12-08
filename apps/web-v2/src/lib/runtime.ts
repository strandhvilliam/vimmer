import { Layer, ManagedRuntime, Effect, Cause, Exit, Chunk } from "effect"
import { DrizzleClient, Database } from "@blikka/db"
import { EmailService } from "@blikka/email"
import { AuthLayer } from "./auth/server"
import { NodeContext } from "@effect/platform-node"
import { TRPCClient } from "./trpc/effect-client"

const MainLayer = Layer.mergeAll(
  DrizzleClient.Default,
  Database.Default,
  EmailService.Default,
  AuthLayer,
  TRPCClient.Default
).pipe(Layer.provide(NodeContext.layer))

export const serverRuntime = ManagedRuntime.make(MainLayer)

export type RuntimeDependencies = ManagedRuntime.ManagedRuntime.Context<typeof serverRuntime>
