import { initTRPC, TRPCError } from "@trpc/server"
import { Cause, Effect, Either, Layer, ManagedRuntime } from "effect"
import { Database } from "@blikka/db"

const servicesLayer = Layer.mergeAll(Database.Default)

type ProvidedOf<L> = L extends Layer.Layer<infer A, any, any> ? A : never

type LiveServices = ProvidedOf<typeof servicesLayer>

const serverRuntime = ManagedRuntime.make(servicesLayer)

export const createTRPCContext = () => ({ runtime: serverRuntime })

type Context = ReturnType<typeof createTRPCContext>

const t = initTRPC.context<Context>().create()

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

export function trpcEffect<TInput, A, E = never, R extends LiveServices = LiveServices>(
  effectFn: (params: { input: TInput; ctx: Record<string, unknown> }) => Effect.Effect<A, E, R>
) {
  return async (params: { input: TInput; ctx: Context }): Promise<A> => {
    const { runtime, ...ctxRest } = params.ctx
    const cleanParams = {
      input: params.input,
      ctx: ctxRest,
    }
    const exit = await runtime.runPromiseExit(effectFn(cleanParams))

    if (exit._tag === "Failure") {
      const error = Cause.squash(exit.cause)
      throw mapEffectErrorToTRPC(error)
    }
    return exit.value
  }
}

function mapEffectErrorToTRPC(error: unknown): TRPCError {
  console.error(error)
  if (error instanceof TRPCError) {
    return error
  }
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "An unknown error occurred",
    cause: error,
  })
}
