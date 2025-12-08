import { Effect } from "effect"
import { RuntimeDependencies } from "./runtime"
import { connection } from "next/server"
import { serverRuntime } from "./runtime"
import { Exit, Chunk, Cause } from "effect"
import { unstable_rethrow } from "next/navigation"
import { Suspense, use } from "react"

export function Next<I extends Array<unknown>, A>(
  effectFn: (...args: I) => Effect.Effect<A, never, RuntimeDependencies>
) {
  return (...args: I): A =>
    use(
      (async () => {
        await connection()
        const res = await serverRuntime.runPromiseExit(effectFn(...args))
        if (Exit.isFailure(res)) {
          const defects = Chunk.toArray(Cause.defects(res.cause))

          if (defects.length === 1) {
            unstable_rethrow(defects[0])
          }

          const errors = Cause.prettyErrors(res.cause)
          throw errors[0]
        }

        return res.value
      })()
    )
}

export const Page = Next
export const Component = Next

export function Layout<I extends Array<unknown>, A>(
  effectFn: (...args: I) => Effect.Effect<A, never, RuntimeDependencies>
) {
  const ComponentWithData = Next(effectFn)
  return function SuspenseLayout(
    props: I extends [] ? { children?: unknown } : I extends [infer P] ? P : unknown
  ) {
    return (
      <Suspense fallback={null}>
        {/* @ts-expect-error passthrough props shape depends on caller */}
        <ComponentWithData {...(props as unknown as I[number])} />
      </Suspense>
    )
  }
}

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
