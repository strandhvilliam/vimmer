import { createTRPCRouter, publicProcedure, trpcEffect } from "../trpc"
import { Schema, Effect } from "effect"
import { Database } from "@blikka/db"

export const participantRouter = createTRPCRouter({
  getByDomain: publicProcedure
    .input(Schema.standardSchemaV1(Schema.Struct({ domain: Schema.String })))
    .query(
      trpcEffect(({ input }) =>
        Effect.gen(function* () {
          const db = yield* Database
          return yield* db.participantsQueries.getParticipantsByDomain({ domain: input.domain })
        })
      )
    ),

  // getParticipantsWithoutSubmissions: publicProcedure.input().query(() => {}),

  // getByDomainPaginated: publicProcedure.input().query(() => {}),

  // getById: publicProcedure.input().query(() => {}),

  // getByReference: publicProcedure.input().query(() => {}),

  // create: publicProcedure.input().mutation(() => {}),

  // update: publicProcedure.input().mutation(() => {}),

  // delete: publicProcedure.input().mutation(() => {}),

  // incrementUploadCounter: publicProcedure.input().mutation(() => {}),
})
