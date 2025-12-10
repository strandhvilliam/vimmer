import { initTRPC, TRPCError } from "@trpc/server"
import { Cause, Effect, ManagedRuntime } from "effect"
import { Database, DbConnectionError, DrizzleClient } from "@blikka/db"
import { BetterAuthService, type Session } from "@blikka/auth"
import { EmailService } from "@blikka/email"
import { getSession } from "./utils"

export type MainServices = BetterAuthService | DrizzleClient | EmailService | Database

export const createTRPCContext = async (opts: {
  runtime: ManagedRuntime.ManagedRuntime<MainServices, DbConnectionError>
  headers: Headers
}) => {
  const session = await opts.runtime.runPromise(getSession({ headers: opts.headers }))
  return { runtime: opts.runtime, session }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
export type ContextWithoutRuntime = Omit<Context, "runtime">
export type AuthenticatedContext = Omit<Context, "session"> & { session: Session }
export type AuthenticatedContextWithoutRuntime = Omit<AuthenticatedContext, "runtime">

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
