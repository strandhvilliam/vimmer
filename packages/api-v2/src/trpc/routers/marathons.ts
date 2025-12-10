import { Effect, Schema } from "effect"
import { authProcedure, createTRPCRouter, publicProcedure, trpcEffect } from "../root"
import { Database } from "@blikka/db"

export const marathonRouter = createTRPCRouter({
  getUserMarathons: authProcedure.query(
    trpcEffect(
      Effect.fn("@blikka/api/marathonRouter/getAllMarathons")(function* ({ ctx }) {
        const db = yield* Database
        return yield* db.usersQueries.getMarathonsByUserId({ userId: ctx.session.user.id })
      })
    )
  ),
})
