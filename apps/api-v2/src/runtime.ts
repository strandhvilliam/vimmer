import { TRPCError } from "@trpc/server"
import { Effect, Either, Layer, ManagedRuntime } from "effect"
import type { YieldWrap } from "effect/Utils"
import { ExampleService } from "./service"

export const serverRuntime = ManagedRuntime.make(Layer.mergeAll(ExampleService.Default))

export function runEffect<A>(
  gen: () => Generator<YieldWrap<any>, A, never>
): ({ ctx }: { ctx: { runtime: ManagedRuntime.ManagedRuntime<any, any> } }) => Promise<A> {
  return async ({ ctx }) => {
    const result = await ctx.runtime.runPromise(Effect.gen(gen).pipe(Effect.either))
    if (Either.isLeft(result)) {
      const error = result.left

      if (error instanceof TRPCError) {
        throw error
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unknown error occurred",
        cause: error,
      })
    }

    return result.right
  }
}
