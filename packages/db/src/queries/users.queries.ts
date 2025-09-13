import { Effect, Option } from "effect"
import { Database } from "../database"
import { and, eq } from "drizzle-orm"
import { marathons, user, userMarathons } from "../schema"
import type { NewUser, NewUserMarathonRelation } from "../types"
import { DrizzleClient } from "../drizzle-client"
import { SqlError } from "@effect/sql/SqlError"

export class UsersQueries extends Effect.Service<UsersQueries>()(
  "@blikka/db/users-queries",
  {
    dependencies: [DrizzleClient.Default],
    effect: Effect.gen(function* () {
      const db = yield* DrizzleClient

      const getUserByIdQuery = Effect.fn("UsersQueries.getUserByIdQuery")(
        function* ({ id }: { id: string }) {
          const result = yield* db.query.user.findFirst({
            where: eq(user.id, id),
          })
          return Option.fromNullable(result)
        }
      )

      const getUserWithMarathonsQuery = Effect.fn(
        "UsersQueries.getUserWithMarathonsQuery"
      )(function* ({ userId }: { userId: string }) {
        const result = yield* db.query.user.findFirst({
          where: eq(user.id, userId),
          with: {
            userMarathons: {
              with: {
                marathon: true,
              },
            },
          },
        })
        return Option.fromNullable(result)
      })

      const getMarathonsByUserIdQuery = Effect.fn(
        "UsersQueries.getMarathonsByUserIdQuery"
      )(function* ({ userId }: { userId: string }) {
        const result = yield* db.query.userMarathons.findMany({
          where: eq(userMarathons.userId, userId),
          with: {
            marathon: true,
          },
        })

        return result.map((userMarathon) => userMarathon.marathon)
      })

      const getUserByEmailWithMarathonsQuery = Effect.fn(
        "UsersQueries.getUserByEmailWithMarathonsQuery"
      )(function* ({ email }: { email: string }) {
        const result = yield* db.query.user.findFirst({
          where: eq(user.email, email),
          with: {
            userMarathons: true,
          },
        })
        return Option.fromNullable(result)
      })

      const getStaffMembersByDomainQuery = Effect.fn(
        "UsersQueries.getStaffMembersByDomainQuery"
      )(function* ({ domain }: { domain: string }) {
        const result = yield* db.query.marathons.findFirst({
          where: eq(marathons.domain, domain),
          with: {
            userMarathons: {
              with: {
                user: true,
              },
            },
          },
        })
        return result?.userMarathons ?? []
      })

      const getStaffMemberByIdQuery = Effect.fn(
        "UsersQueries.getStaffMemberByIdQuery"
      )(function* ({ staffId, domain }: { staffId: string; domain: string }) {
        const marathon = yield* db.query.marathons.findFirst({
          where: eq(marathons.domain, domain),
          columns: { id: true },
        })

        if (!marathon) {
          return yield* Option.none()
        }

        const result = yield* db.query.user.findFirst({
          where: eq(user.id, staffId),
          with: {
            userMarathons: {
              where: eq(userMarathons.marathonId, marathon.id),
            },
            participantVerifications: {
              with: {
                participant: true,
              },
            },
          },
        })

        if (!result?.userMarathons[0]) {
          return yield* Option.none()
        }

        const filteredParticipantVerifications =
          result.participantVerifications.filter(
            (pv) => pv.participant.marathonId === marathon.id
          )

        const resp = {
          ...result.userMarathons[0],
          user: {
            ...result,
            participantVerifications: filteredParticipantVerifications,
          },
        }
        return Option.some(resp)
      })

      const createUserMutation = Effect.fn("UsersQueries.createUserMutation")(
        function* ({ data }: { data: NewUser }) {
          const [result] = yield* db.insert(user).values(data).returning()

          if (!result) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Failed to create user",
              })
            )
          }
          return result
        }
      )

      const updateUserMutation = Effect.fn("UsersQueries.updateUserMutation")(
        function* ({ id, data }: { id: string; data: Partial<NewUser> }) {
          const [result] = yield* db
            .update(user)
            .set(data)
            .where(eq(user.id, id))
            .returning()

          if (!result) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Failed to update user",
              })
            )
          }
          return result
        }
      )

      const deleteUserMutation = Effect.fn("UsersQueries.deleteUserMutation")(
        function* ({ id }: { id: string }) {
          const [result] = yield* db
            .delete(user)
            .where(eq(user.id, id))
            .returning()

          if (!result) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Failed to delete user",
              })
            )
          }
          return result
        }
      )

      const createUserMarathonRelationMutation = Effect.fn(
        "UsersQueries.createUserMarathonRelationMutation"
      )(function* ({ data }: { data: NewUserMarathonRelation }) {
        const [result] = yield* db
          .insert(userMarathons)
          .values(data)
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to create user marathon relation",
            })
          )
        }
        return result
      })

      const updateUserMarathonRelationMutation = Effect.fn(
        "UsersQueries.updateUserMarathonRelationMutation"
      )(function* ({
        userId,
        marathonId,
        data,
      }: {
        userId: string
        marathonId: number
        data: Partial<Pick<NewUserMarathonRelation, "role">>
      }) {
        const [result] = yield* db
          .update(userMarathons)
          .set(data)
          .where(
            and(
              eq(userMarathons.userId, userId),
              eq(userMarathons.marathonId, marathonId)
            )
          )
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to update user marathon relation",
            })
          )
        }
        return result
      })

      const deleteUserMarathonRelationMutation = Effect.fn(
        "UsersQueries.deleteUserMarathonRelationMutation"
      )(function* ({
        userId,
        marathonId,
      }: {
        userId: string
        marathonId: number
      }) {
        const [result] = yield* db
          .delete(userMarathons)
          .where(
            and(
              eq(userMarathons.userId, userId),
              eq(userMarathons.marathonId, marathonId)
            )
          )
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to delete user marathon relation",
            })
          )
        }
        return result
      })

      return {
        getUserByIdQuery,
        getUserWithMarathonsQuery,
        getMarathonsByUserIdQuery,
        getUserByEmailWithMarathonsQuery,
        getStaffMembersByDomainQuery,
        getStaffMemberByIdQuery,
        createUserMutation,
        updateUserMutation,
        deleteUserMutation,
        createUserMarathonRelationMutation,
        updateUserMarathonRelationMutation,
        deleteUserMarathonRelationMutation,
      }
    }),
  }
) {}
