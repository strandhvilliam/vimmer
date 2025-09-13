import { Effect, Option } from "effect"
import { sponsors } from "../schema"
import { DrizzleClient } from "../drizzle-client"
import type { Database } from "../database"
import { and, eq } from "drizzle-orm"
import type { NewSponsor } from "../types"
import { SqlError } from "@effect/sql/SqlError"

export class SponsorsQueries extends Effect.Service<SponsorsQueries>()(
  "@blikka/db/sponsors-queries",
  {
    dependencies: [DrizzleClient.Default],
    effect: Effect.gen(function* () {
      const db = yield* DrizzleClient

      const getSponsorsByMarathonIdQuery = Effect.fn(
        "SponsorsQueries.getSponsorsByMarathonIdQuery"
      )(function* ({ marathonId }: { marathonId: number }) {
        const result = yield* db.query.sponsors.findMany({
          where: eq(sponsors.marathonId, marathonId),
        })
        return result
      })

      const getSponsorsByTypeQuery = Effect.fn(
        "SponsorsQueries.getSponsorsByTypeQuery"
      )(function* ({ marathonId, type }: { marathonId: number; type: string }) {
        const result = yield* db.query.sponsors.findMany({
          where: and(
            eq(sponsors.marathonId, marathonId),
            eq(sponsors.type, type)
          ),
        })
        return result
      })

      const getSponsorByIdQuery = Effect.fn(
        "SponsorsQueries.getSponsorByIdQuery"
      )(function* ({ id }: { id: number }) {
        const result = yield* db.query.sponsors.findFirst({
          where: eq(sponsors.id, id),
        })
        return Option.fromNullable(result)
      })

      const createSponsorMutation = Effect.fn(
        "SponsorsQueries.createSponsorMutation"
      )(function* ({ data }: { data: NewSponsor }) {
        const [result] = yield* db
          .insert(sponsors)
          .values({
            ...data,
            uploadedAt: data.uploadedAt || new Date().toISOString(),
          })
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to create sponsor",
            })
          )
        }
        return result
      })

      const updateSponsorMutation = Effect.fn(
        "SponsorsQueries.updateSponsorMutation"
      )(function* ({ id, data }: { id: number; data: Partial<NewSponsor> }) {
        const updateData = {
          ...data,
          ...(data.key && { uploadedAt: new Date().toISOString() }),
        }

        const [result] = yield* db
          .update(sponsors)
          .set(updateData)
          .where(eq(sponsors.id, id))
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to update sponsor",
            })
          )
        }
        return result
      })

      const deleteSponsorMutation = Effect.fn(
        "SponsorsQueries.deleteSponsorMutation"
      )(function* ({ id }: { id: number }) {
        const [result] = yield* db
          .delete(sponsors)
          .where(eq(sponsors.id, id))
          .returning({ id: sponsors.id })

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to delete sponsor",
            })
          )
        }
        return result
      })

      return {
        getSponsorsByMarathonIdQuery,
        getSponsorsByTypeQuery,
        getSponsorByIdQuery,
        createSponsorMutation,
        updateSponsorMutation,
        deleteSponsorMutation,
      }
    }),
  }
) {}
