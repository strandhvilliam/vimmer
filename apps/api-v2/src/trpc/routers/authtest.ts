import { Effect, Schema } from "effect"
import { createTRPCRouter, publicProcedure, trpcEffect } from "../trpc"

export const authTestRouter = createTRPCRouter({
  getSomething: publicProcedure
    .input(
      Schema.standardSchemaV1(
        Schema.Struct({
          name: Schema.String,
        })
      )
    )
    .query(
      trpcEffect(({ input }) =>
        Effect.gen(function* () {
          return Effect.succeed({ message: `Something, ${input.name}!` })
        })
      )
    ),
})
