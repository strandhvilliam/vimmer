import { initTRPC, TRPCError } from "@trpc/server"
import { Cause, Effect, Layer, ManagedRuntime, Option } from "effect"
import { Database, DbConnectionError, DrizzleClient } from "@blikka/db"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
import type { Context as HonoContext } from "hono"
import { AuthConfig, BetterAuthService, type Session } from "@blikka/auth"
import { EmailService } from "@blikka/email"

// const baseUrl = process.env.BLIKKA_PRODUCTION_URL
//   ? `https://${process.env.BLIKKA_PRODUCTION_URL}`
//   : "http://localhost:3002"

// const AuthConfigLayer = Layer.succeed(AuthConfig, {
//   baseUrl,
//   secret: process.env.BETTER_AUTH_SECRET || "",
//   emailConfig: {
//     companyName: "Blikka",
//     companyLogoUrl: "https://blikka.app/images/logo.png",
//   },
// })

// const AuthLayer = Layer.provide(BetterAuthService.Default, AuthConfigLayer)

// const servicesLayer = Layer.mergeAll(
//   Database.Default,
//   DrizzleClient.Default,
//   EmailService.Default,
//   AuthLayer
// )

// type ProvidedOf<L> = L extends Layer.Layer<infer A, any, any> ? A : never

type MainServices = BetterAuthService | DrizzleClient | EmailService | Database

// const serverRuntime = ManagedRuntime.make(servicesLayer)

const getSession = Effect.fnUntraced(function* ({ headers }: { headers: Headers }) {
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

export const createTRPCContext = async (opts: {
  runtime: ManagedRuntime.ManagedRuntime<MainServices, DbConnectionError>
  headers: Headers
}) => {
  const source = opts.headers.get("x-trpc-source")
  const cookies = opts.headers.get("cookie")

  console.log("=== createTRPCContext ===")
  console.log("source:", source)
  console.log("has cookies:", !!cookies)
  console.log("cookie header:", cookies?.substring(0, 100))

  const session = await opts.runtime.runPromise(getSession({ headers: opts.headers }))

  console.log("session:", session ? `User: ${session.user?.email || session.user?.id}` : "null")
  console.log("========================")

  return { runtime: opts.runtime, session }
}

// export const createTRPCContext = async (_: unknown, ctx: HonoContext) => {
//   return { runtime: serverRuntime, session: null as Session | null }
// }

type Context = Awaited<ReturnType<typeof createTRPCContext>>
type ContextWithoutRuntime = Omit<Context, "runtime">
type AuthenticatedContext = Omit<Context, "session"> & { session: Session }
type AuthenticatedContextWithoutRuntime = Omit<AuthenticatedContext, "runtime">

const t = initTRPC.context<Context>().create()

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

export const authProcedure = t.procedure.use(async ({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be authenticated to access this resource",
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    } as AuthenticatedContext,
  })
})

export function trpcEffect<
  TInput,
  A,
  E = never,
  R extends MainServices = MainServices,
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
