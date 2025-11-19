import { initTRPC } from "@trpc/server"
import { serverRuntime } from "./runtime"

export const createContext = () => ({ runtime: serverRuntime })

type Context = ReturnType<typeof createContext>

export const t = initTRPC.context<Context>().create()

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure
