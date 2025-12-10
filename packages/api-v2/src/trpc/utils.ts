import { Cause, Effect } from "effect"
import {
  type Context,
  type AuthenticatedContext,
  type ContextWithoutRuntime,
  type AuthenticatedContextWithoutRuntime,
} from "./root"
import { type RequiredServices } from "./root"
import { TRPCError } from "@trpc/server"
import { BetterAuthService } from "@blikka/auth"
import { Database } from "@blikka/db"
import { RedisClient } from "@blikka/redis"

export function trpcEffect<
  TInput,
  A,
  E = never,
  R extends RequiredServices = RequiredServices,
  TCtx extends Context | AuthenticatedContext = Context,
>(
  effectFn: (params: {
    input: TInput
    ctx: TCtx extends AuthenticatedContext
      ? AuthenticatedContextWithoutRuntime
      : ContextWithoutRuntime
  }) => Effect.Effect<A, E, R>
) {
  return async (params: { input: TInput; ctx: TCtx }): Promise<A> => {
    const { runtime, ...ctxRest } = params.ctx
    const cleanParams = {
      input: params.input,
      ctx: ctxRest,
    }
    const exit = await runtime.runPromiseExit(effectFn(cleanParams as any))

    if (exit._tag === "Failure") {
      const error = Cause.squash(exit.cause)
      throw mapEffectErrorToTRPC(error)
    }
    return exit.value
  }
}

function mapEffectErrorToTRPC(error: unknown): TRPCError {
  if (error instanceof TRPCError) {
    return error
  }
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "An unknown error occurred",
    cause: error,
  })
}

export const getSession = Effect.fnUntraced(function* ({ headers }: { headers: Headers }) {
  const auth = yield* BetterAuthService
  return yield* Effect.tryPromise({
    try: () =>
      auth.api.getSession({
        headers,
      }),
    catch: (error) =>
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "An unknown error occurred",
        cause: error,
      }),
  })
})

export const getPermissions = Effect.fnUntraced(function* ({ userId }: { userId?: string }) {
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  console.log("RUNNING GET PERMISSIONS EFFECT")
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")

  const redis = yield* RedisClient

  if (!userId) {
    return yield* Effect.succeed([])
  }
  const db = yield* Database
  return yield* db.permissionsQueries.getPermissionsByUserId({ userId })
})
