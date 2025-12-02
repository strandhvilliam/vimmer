import { Effect, Schema } from "effect"
import { createTRPCRouter, publicProcedure, trpcEffect } from "../trpc"
import { Database } from "@blikka/db"

export const marathonRouter = createTRPCRouter({
  getAllMarathons: publicProcedure.query(
    trpcEffect(
      Effect.fn("@blikka/api/marathonRouter/getAllMarathons")(function* () {
        const db = yield* Database
        return yield* db.marathonsQueries.getMarathons()
      })
    )
  ),
})
