import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { appRouter } from "./trpc/routers/_app"
import { createTRPCContext } from "./trpc"
import { secureHeaders } from "hono/secure-headers"
import { realtimeRevalidateMiddleware } from "./middlewares/realtime-revalidate"
import { errorHandler } from "./utils/error-handler"
import { handle } from "hono/aws-lambda"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

const app = new Hono()

// app.use(secureHeaders())

// app.use(realtimeRevalidateMiddleware())

// app.use(async (c, next) => {
//   await next()
//   console.log(c.res.ok, c.res.status)
// })

// app.use(async (c, next) => {
//   await next()
// })

// app.onError(errorHandler)

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createTRPCContext,
  })
)

app.get("/", (c) => c.text("Hello World"))

app.get("/health", (c) => {
  console.log("health check", new Date().toISOString())
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

export const handler = handle(app)
