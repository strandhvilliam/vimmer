import { initTRPC, TRPCError } from "@trpc/server"
import { Cause, Effect, Layer, ManagedRuntime, Option } from "effect"
import { Database, DrizzleClient } from "@blikka/db"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
import type { Context as HonoContext } from "hono"
import { AuthConfig, BetterAuthService, type Session } from "@blikka/auth"
import { EmailService } from "@blikka/email"

// Create AuthConfigLayer
const baseUrl = process.env.BLIKKA_PRODUCTION_URL
  ? `https://${process.env.BLIKKA_PRODUCTION_URL}`
  : "http://localhost:3002"

const AuthConfigLayer = Layer.succeed(AuthConfig, {
  baseUrl,
  secret: process.env.BETTER_AUTH_SECRET || "",
  emailConfig: {
    companyName: "Blikka",
    companyLogoUrl: "https://blikka.app/images/logo.png",
  },
})

// BetterAuthService.Default exists at runtime (Effect Service pattern)
const AuthLayer = Layer.provide(BetterAuthService.Default, AuthConfigLayer)

const servicesLayer = Layer.mergeAll(
  Database.Default,
  DrizzleClient.Default,
  EmailService.Default,
  AuthLayer
)

type ProvidedOf<L> = L extends Layer.Layer<infer A, any, any> ? A : never

type LiveServices = ProvidedOf<typeof servicesLayer>

const serverRuntime = ManagedRuntime.make(servicesLayer)

export const createTRPCContext = async (_: unknown, ctx: HonoContext) => {
  const getSessionEffect = Effect.gen(function* () {
    const auth = yield* BetterAuthService

    const headers = new Headers(ctx.req.raw.headers)

    const session = yield* Effect.tryPromise({
      try: () =>
        auth.api.getSession({
          headers,
        }),
      catch: (error) => error as Error,
    })
    return Option.fromNullable(session)
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError(error instanceof Error ? error.message : String(error))
    ),
    Effect.catchAll(() => Effect.succeed(Option.none<Session>()))
  )

  const sessionOption = await serverRuntime.runPromise(getSessionEffect)
  const session = Option.isSome(sessionOption) ? sessionOption.value : null

  return { runtime: serverRuntime, session }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

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

  console.log("ctx", ctx.session)

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})

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
