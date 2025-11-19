import { createTRPCRouter, publicProcedure, trpcEffect } from "../trpc"
import { Schema, Effect } from "effect"
import { Database } from "@blikka/db"

export const participantRouter = createTRPCRouter({
  getByDomainInfinite: publicProcedure
    .input(
      Schema.standardSchemaV1(
        Schema.Struct({
          domain: Schema.String,
          cursor: Schema.NullishOr(Schema.String),
          limit: Schema.NullishOr(
            Schema.Number.pipe(Schema.greaterThan(0), Schema.lessThanOrEqualTo(100))
          ),
        })
      )
    )
    .query(
      trpcEffect(({ input }) =>
        Effect.gen(function* () {
          const db = yield* Database
          return yield* db.participantsQueries.getParticipantsByDomain({ domain: input.domain })
        })
      )
    ),

  getById: publicProcedure
    .input(Schema.standardSchemaV1(Schema.Struct({ id: Schema.Number })))
    .query(() => {}),

  // getByReference: publicProcedure.input().query(() => {}),

  // create: publicProcedure.input().mutation(() => {}),

  // update: publicProcedure.input().mutation(() => {}),

  // delete: publicProcedure.input().mutation(() => {}),

  // incrementUploadCounter: publicProcedure.input().mutation(() => {}),
})
