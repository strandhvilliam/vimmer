import { createTRPCRouter, publicProcedure } from "./trpc"
import { runEffect } from "./runtime"
import { ExampleService } from "./service"

export const apiRouter = createTRPCRouter({
  ping: publicProcedure.query(
    runEffect(function* () {
      const service = yield* ExampleService
      return yield* service.ping()
    })
  ),
})
