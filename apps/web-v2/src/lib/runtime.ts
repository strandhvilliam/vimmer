import { Layer, ManagedRuntime, Effect, Cause, Exit, Chunk } from "effect"
import { DrizzleClient, Database } from "@blikka/db"
import { EmailService } from "@blikka/email"
import { AuthLayer } from "./auth/server"
import { unstable_rethrow } from "next/navigation"
import { NodeContext } from "@effect/platform-node"

const MainLayer = Layer.mergeAll(
  DrizzleClient.Default,
  Database.Default,
  EmailService.Default,
  AuthLayer
).pipe(Layer.provide(NodeContext.layer))

export const serverRuntime = ManagedRuntime.make(MainLayer)

export type RuntimeDependencies = ManagedRuntime.ManagedRuntime.Context<typeof serverRuntime>

export function Next<I extends Array<unknown>, A>(
  effectFn: (...args: I) => Effect.Effect<A, never, RuntimeDependencies>
) {
  return async (...args: I): Promise<A> => {
    return serverRuntime.runPromiseExit(effectFn(...args)).then((res) => {
      if (Exit.isFailure(res)) {
        const defects = Chunk.toArray(Cause.defects(res.cause))

        if (defects.length === 1) {
          unstable_rethrow(defects[0])
        }

        const errors = Cause.prettyErrors(res.cause)
        throw errors[0]
      }

      return res.value
    })
  }
}

export const Page = Next
export const Component = Next
export const Layout = Next
export const Route = Next
export const Action = Next

export type ActionResponse<T> = T extends void
  ? {
      data: undefined
      error: string | null
    }
  : {
      data: T
      error: string | null
    }

export function toActionResponse<T>(
  effect: Effect.Effect<T, unknown, RuntimeDependencies>
): Effect.Effect<ActionResponse<T>, never, RuntimeDependencies> {
  return effect.pipe(
    Effect.map((data) => ({ data, error: null as string | null }) as ActionResponse<T>),
    Effect.tapError((error) => Effect.logError(error)),
    Effect.catchAll((error) =>
      Effect.succeed({
        data: undefined as T extends void ? undefined : T,
        error: error instanceof Error ? error.message : String(error),
      } as ActionResponse<T>)
    )
  )
}
