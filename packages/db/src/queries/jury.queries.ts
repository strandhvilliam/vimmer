import { DrizzleClient } from "../drizzle-client"
import { Effect, Option } from "effect"
import { eq, desc, and, lt } from "drizzle-orm"
import {
  juryInvitations,
  juryRatings,
  marathons,
  participants,
  submissions,
} from "../schema"
import type {
  NewJuryInvitation,
  Participant,
  Submission,
  Topic,
} from "../types"
import { SqlError } from "@effect/sql/SqlError"

export class JuryQueries extends Effect.Service<JuryQueries>()(
  "@blikka/db/jury-queries",
  {
    dependencies: [DrizzleClient.Default],
    effect: Effect.gen(function* () {
      const db = yield* DrizzleClient

      const getJuryInvitationsByMarathonIdQuery = Effect.fn(
        "JuryQueries.getJuryInvitatinosByMarathonIdQuery"
      )(function* ({ id }: { id: number }) {
        const result = yield* db.query.juryInvitations.findMany({
          where: eq(juryInvitations.marathonId, id),
          orderBy: [desc(juryInvitations.createdAt)],
        })
        return result
      })

      const getJuryInvitationByIdQuery = Effect.fn(
        "JuryQueries.getJuryInvitationByIdQuery"
      )(function* ({ id }: { id: number }) {
        const result = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, id),
        })
        return Option.fromNullable(result)
      })

      const getJuryInvitationsByDomainQuery = Effect.fn(
        "JuryQueries.getJuryInvitationsByDomainQuery"
      )(function* ({ domain }: { domain: string }) {
        const marathon = yield* db
          .select({ id: marathons.id })
          .from(marathons)
          .where(eq(marathons.domain, domain))
          .limit(1)

        if (!marathon.length) {
          return []
        }

        const marathonId = marathon[0]!.id

        const result = yield* db.query.juryInvitations.findMany({
          where: eq(juryInvitations.marathonId, marathonId),
          orderBy: [desc(juryInvitations.createdAt)],
          with: {
            competitionClass: true,
            deviceGroup: true,
            topic: true,
          },
        })

        return result
      })

      const createJuryInvitationMutation = Effect.fn(
        "JuryQueries.createJuryInvitationMutation"
      )(function* ({ data }: { data: NewJuryInvitation }) {
        const [result] = yield* db
          .insert(juryInvitations)
          .values(data)
          .returning({ id: juryInvitations.id })

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to create jury invitation",
            })
          )
        }

        return result
      })

      const updateJuryInvitationMutation = Effect.fn(
        "JuryQueries.updateJuryInvitationMutation"
      )(function* ({
        id,
        data,
      }: {
        id: number
        data: Partial<NewJuryInvitation>
      }) {
        const [result] = yield* db
          .update(juryInvitations)
          .set(data)
          .where(eq(juryInvitations.id, id))
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to update jury invitation",
            })
          )
        }
        return result
      })

      const deleteJuryInvitationMutation = Effect.fn(
        "JuryQueries.deleteJuryInvitationMutation"
      )(function* ({ id }: { id: number }) {
        const [result] = yield* db
          .delete(juryInvitations)
          .where(eq(juryInvitations.id, id))
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to delete jury invitation",
            })
          )
        }
        return result
      })

      //   const TokenPayloadSchema = z.object({
      //     domain: z.string(),
      //     invitationId: z.number(),
      //     iat: z.number(),
      //     exp: z.number(),
      //   })

      //   async function verifyJuryToken(token: string) {
      //     try {
      //       const secret = process.env.JURY_JWT_SECRET
      //       if (!secret) {
      //         throw new Error("JWT SECRET is not set")
      //       }
      //       const { payload } = await jwtVerify(
      //         token,
      //         new TextEncoder().encode(secret)
      //       )

      //       const parsed = TokenPayloadSchema.safeParse(payload)
      //       if (parsed.success) {
      //         return parsed.data
      //       }
      //       return null
      //     } catch {
      //       return null
      //     }
      //   }

      const getJuryDataByTokenPayloadQuery = Effect.fn(
        "JuryQueries.getJuryDataByTokenQuery"
      )(function* ({
        domain,
        invitationId,
      }: {
        domain: string
        invitationId: number
      }) {
        const invitation = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, invitationId),
          with: {
            competitionClass: true,
            deviceGroup: true,
            topic: true,
            marathon: true,
          },
        })

        if (!invitation) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation not found",
            })
          )
        }

        const marathon = yield* db.query.marathons.findFirst({
          where: eq(marathons.domain, domain),
        })

        if (!marathon || invitation.marathonId !== marathon.id) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Marathon not found",
            })
          )
        }
        return invitation
      })

      const getJuryParticipantSubmissionsQuery = Effect.fn(
        "JuryQueries.getJuryParticipantSubmissionsQuery"
      )(function* ({
        domain,
        invitationId,
        participantId,
      }: {
        domain: string
        invitationId: number
        participantId: number
      }) {
        const invitation = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, invitationId),
          with: {
            competitionClass: true,
            deviceGroup: true,
            topic: true,
          },
        })

        if (!invitation) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation not found",
            })
          )
        }

        const marathon = yield* db.query.marathons.findFirst({
          where: eq(marathons.domain, domain),
        })

        if (!marathon || invitation.marathonId !== marathon.id) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Marathon not found",
            })
          )
        }

        const marathonId = marathon.id

        const conditions = [
          eq(submissions.marathonId, marathonId),
          eq(submissions.status, "uploaded"),
          eq(submissions.participantId, participantId),
        ]

        if (
          invitation.competitionClassId !== null &&
          invitation.competitionClassId !== undefined
        ) {
          conditions.push(
            eq(participants.competitionClassId, invitation.competitionClassId)
          )
        }

        if (
          invitation.deviceGroupId !== null &&
          invitation.deviceGroupId !== undefined
        ) {
          conditions.push(
            eq(participants.deviceGroupId, invitation.deviceGroupId)
          )
        }

        if (invitation.topicId !== null && invitation.topicId !== undefined) {
          conditions.push(eq(submissions.topicId, invitation.topicId))
        }

        const result = yield* db.query.submissions.findMany({
          where: and(...conditions),
          with: {
            participant: {
              with: {
                competitionClass: true,
                deviceGroup: true,
              },
            },
            topic: true,
          },
          orderBy: [desc(submissions.id)],
        })

        // Filter out submissions without preview images
        const validSubmissions = result.filter(
          (submission) => submission.previewKey
        )

        return {
          submissions: validSubmissions,
          invitation,
        }
      })

      const createJuryRatingMutation = Effect.fn(
        "JuryQueries.createJuryRatingMutation"
      )(function* ({
        invitationId,
        participantId,
        rating,
        notes,
      }: {
        invitationId: number
        participantId: number
        rating: number
        notes?: string
      }) {
        const invitation = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, invitationId),
        })

        if (!invitation) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation not found",
            })
          )
        }

        const [result] = yield* db
          .insert(juryRatings)
          .values({
            invitationId,
            participantId,
            rating,
            notes: notes || "",
            marathonId: invitation.marathonId,
          })
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to create jury rating",
            })
          )
        }

        return result
      })

      const updateJuryRatingMutation = Effect.fn(
        "JuryQueries.updateJuryRatingMutation"
      )(function* ({
        invitationId,
        participantId,
        rating,
        notes,
        finalRanking,
      }: {
        invitationId: number
        participantId: number
        rating: number
        notes?: string
        finalRanking?: number
      }) {
        const result = yield* db
          .update(juryRatings)
          .set({
            rating,
            notes: notes || "",
            finalRanking,
          })
          .where(
            and(
              eq(juryRatings.invitationId, invitationId),
              eq(juryRatings.participantId, participantId)
            )
          )
          .returning()

        return result
      })

      const getJuryRatingQuery = Effect.fn("JuryQueries.getJuryRatingQuery")(
        function* ({
          invitationId,
          participantId,
        }: {
          invitationId: number
          participantId: number
        }) {
          const invitation = yield* db.query.juryInvitations.findFirst({
            where: eq(juryInvitations.id, invitationId),
          })

          if (!invitation) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Invitation not found",
              })
            )
          }

          const result = yield* db.query.juryRatings.findFirst({
            where: and(
              eq(juryRatings.invitationId, invitationId),
              eq(juryRatings.participantId, participantId)
            ),
          })

          return Option.fromNullable(result)
        }
      )

      const deleteJuryRatingMutation = Effect.fn(
        "JuryQueries.deleteJuryRatingMutation"
      )(function* ({
        invitationId,
        participantId,
      }: {
        invitationId: number
        participantId: number
      }) {
        const invitation = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, invitationId),
        })

        if (!invitation) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation not found",
            })
          )
        }

        const result = yield* db
          .delete(juryRatings)
          .where(
            and(
              eq(juryRatings.invitationId, invitationId),
              eq(juryRatings.participantId, participantId)
            )
          )
          .returning()

        return Option.fromNullable(result)
      })

      const getJurySubmissionsWithoutFiltersQuery = Effect.fn(
        "JuryQueries.getJurySubmissionWithouFiltersQuery"
      )(function* ({
        invitation,
        cursor,
      }: {
        invitation: any
        cursor?: number
      }) {
        const limit = 50

        if (invitation.inviteType === "topic") {
          if (!invitation.topicId) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Topic not found",
              })
            )
          }

          let cursorSubmission: Submission | null = null

          if (cursor) {
            const [sub] = yield* db
              .select()
              .from(submissions)
              .where(eq(submissions.id, cursor))
              .limit(1)

            if (sub) {
              cursorSubmission = sub
            }
          }

          const topicSubmissions = yield* db.query.submissions.findMany({
            where: cursorSubmission
              ? and(
                  eq(submissions.marathonId, invitation.marathonId),
                  eq(submissions.topicId, invitation.topicId),
                  lt(submissions.createdAt, cursorSubmission.createdAt)
                )
              : and(
                  eq(submissions.marathonId, invitation.marathonId),
                  eq(submissions.topicId, invitation.topicId)
                ),
            with: {
              topic: true,
              participant: {
                columns: {
                  id: true,
                  createdAt: true,
                  reference: true,
                  status: true,
                  contactSheetKey: true,
                },
                with: {
                  competitionClass: true,
                  deviceGroup: true,
                },
              },
            },
            limit: limit + 1,
            orderBy: [desc(submissions.createdAt)],
          })

          let nextCursor: number | null = null
          if (topicSubmissions.length > limit) {
            topicSubmissions.pop()
            const lastSubmission = topicSubmissions.at(-1)
            nextCursor = lastSubmission!.id
          }

          const mapped = topicSubmissions.map((submission) => {
            const { participant, ...rest } = submission
            return {
              ...participant,
              submission: rest,
            }
          })

          return {
            participants: mapped,
            nextCursor,
          }
        } else if (invitation.inviteType === "class") {
          if (!invitation.competitionClassId) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Class not found",
              })
            )
          }

          let cursorParticipant: Participant | null = null

          if (cursor) {
            const [participant] = yield* db
              .select()
              .from(participants)
              .where(eq(participants.id, cursor))
              .limit(1)

            if (participant) {
              cursorParticipant = participant
            }
          }

          const participantsInCompetitionClass =
            yield* db.query.participants.findMany({
              columns: {
                id: true,
                createdAt: true,
                reference: true,
                status: true,
                contactSheetKey: true,
              },
              where: cursorParticipant
                ? and(
                    eq(participants.marathonId, invitation.marathonId),
                    eq(
                      participants.competitionClassId,
                      invitation.competitionClassId
                    ),
                    lt(participants.createdAt, cursorParticipant.createdAt)
                  )
                : and(
                    eq(participants.marathonId, invitation.marathonId),
                    eq(
                      participants.competitionClassId,
                      invitation.competitionClassId
                    )
                  ),
              with: {
                competitionClass: true,
                deviceGroup: true,
              },
              limit: limit + 1,
              orderBy: [desc(participants.createdAt)],
            })

          let nextCursor: number | null = null
          if (participantsInCompetitionClass.length > limit) {
            participantsInCompetitionClass.pop()
            const lastParticipant = participantsInCompetitionClass.at(-1)
            nextCursor = lastParticipant!.id
          }

          const mapped = participantsInCompetitionClass.map((participant) => {
            return {
              ...participant,
              submission: null as unknown as Submission & {
                topic: Topic | null
              },
            }
          })

          return {
            participants: mapped,
            nextCursor,
          }
        } else {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation type not found",
            })
          )
        }
      })

      const getJurySubmissionsWithRatingFiltersQuery = Effect.fn(
        "JuryQueries.getJurySubmissionsWithRatingFiltersQuery"
      )(function* ({
        invitation,
        ratingFilter,
        cursor,
      }: {
        invitation: any
        ratingFilter: number[]
        cursor?: number
      }) {
        const limit = 50

        const allRatings = yield* db.query.juryRatings.findMany({
          where: eq(juryRatings.invitationId, invitation.id),
        })

        const ratingMap = new Map<number, number>()
        allRatings.forEach((rating) => {
          ratingMap.set(rating.participantId, rating.rating)
        })

        const filteredParticipantIds = Array.from(ratingMap.entries())
          .filter(([_, rating]) => ratingFilter.includes(rating))
          .map(([participantId]) => participantId)

        if (ratingFilter.includes(0)) {
          if (invitation.inviteType === "topic") {
            const allTopicParticipants = yield* db
              .selectDistinct({ participantId: submissions.participantId })
              .from(submissions)
              .where(
                and(
                  eq(submissions.marathonId, invitation.marathonId),
                  eq(submissions.topicId, invitation.topicId)
                )
              )

            allTopicParticipants.forEach((p) => {
              if (!ratingMap.has(p.participantId)) {
                filteredParticipantIds.push(p.participantId)
              }
            })
          } else if (invitation.inviteType === "class") {
            const allClassParticipants = yield* db
              .select({ id: participants.id })
              .from(participants)
              .where(
                and(
                  eq(participants.marathonId, invitation.marathonId),
                  eq(
                    participants.competitionClassId,
                    invitation.competitionClassId
                  )
                )
              )

            allClassParticipants.forEach((p) => {
              if (!ratingMap.has(p.id)) {
                filteredParticipantIds.push(p.id)
              }
            })
          }
        }

        if (filteredParticipantIds.length === 0) {
          return {
            participants: [],
            nextCursor: null,
          }
        }

        // For rating-filtered results, we need to implement offset-based pagination
        // since cursor-based pagination becomes complex with pre-filtered participant IDs
        const offset = cursor || 0

        if (invitation.inviteType === "topic") {
          const topicSubmissions = yield* db.query.submissions.findMany({
            where: and(
              eq(submissions.marathonId, invitation.marathonId),
              eq(submissions.topicId, invitation.topicId)
            ),
            with: {
              topic: true,
              participant: {
                columns: {
                  id: true,
                  createdAt: true,
                  reference: true,
                  status: true,
                  contactSheetKey: true,
                },
                with: {
                  competitionClass: true,
                  deviceGroup: true,
                },
              },
            },
            orderBy: [desc(submissions.createdAt)],
          })

          const filteredSubmissions = topicSubmissions.filter(
            (submission) =>
              submission.participant &&
              filteredParticipantIds.includes(submission.participant.id)
          )

          const paginatedSubmissions = filteredSubmissions.slice(
            offset,
            offset + limit + 1
          )

          let nextCursor: number | null = null
          if (paginatedSubmissions.length > limit) {
            paginatedSubmissions.pop()
            nextCursor = offset + limit
          }

          const mapped = paginatedSubmissions.map((submission) => {
            const { participant, ...rest } = submission
            return {
              ...participant,
              submission: rest,
            }
          })

          return {
            participants: mapped,
            nextCursor,
          }
        } else if (invitation.inviteType === "class") {
          const participantsInCompetitionClass =
            yield* db.query.participants.findMany({
              columns: {
                id: true,
                createdAt: true,
                reference: true,
                status: true,
                contactSheetKey: true,
              },
              where: and(
                eq(participants.marathonId, invitation.marathonId),
                eq(
                  participants.competitionClassId,
                  invitation.competitionClassId
                )
              ),
              with: {
                competitionClass: true,
                deviceGroup: true,
              },
              orderBy: [desc(participants.createdAt)],
            })

          const filteredParticipants = participantsInCompetitionClass.filter(
            (participant) => filteredParticipantIds.includes(participant.id)
          )

          const paginatedParticipants = filteredParticipants.slice(
            offset,
            offset + limit + 1
          )

          let nextCursor: number | null = null
          if (paginatedParticipants.length > limit) {
            paginatedParticipants.pop()
            nextCursor = offset + limit
          }

          const mapped = paginatedParticipants.map((participant) => {
            return {
              ...participant,
              submission: null as unknown as Submission & {
                topic: Topic | null
              },
            }
          })

          return {
            participants: mapped,
            nextCursor,
          }
        } else {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation type not found",
            })
          )
        }
      })

      const getJurySubmissionsFromTokenQuery = Effect.fn(
        "JuryQueries.getJurySubmissionsFromTokenQuery"
      )(function* ({
        invitationId,
        cursor,
        ratingFilter,
      }: {
        invitationId: number
        cursor?: number
        ratingFilter?: number[]
      }) {
        const invitation = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, invitationId),
        })

        if (!invitation) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation not found",
            })
          )
        }

        if (ratingFilter && ratingFilter.length > 0) {
          return yield* getJurySubmissionsWithRatingFiltersQuery({
            invitation,
            ratingFilter,
            cursor,
          })
        } else {
          return yield* getJurySubmissionsWithoutFiltersQuery({
            invitation,
            cursor,
          })
        }
      })

      const getJuryRatingsByInvitationQuery = Effect.fn(
        "JuryQueries.getJuryRatingsByInvitationQuery"
      )(function* ({ invitationId }: { invitationId: number }) {
        const invitation = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, invitationId),
        })

        if (!invitation) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation not found",
            })
          )
        }

        const ratings = yield* db.query.juryRatings.findMany({
          where: and(
            eq(juryRatings.invitationId, invitation.id),
            eq(juryRatings.marathonId, invitation.marathonId)
          ),
          columns: {
            participantId: true,
            rating: true,
            notes: true,
          },
        })

        return ratings
      })

      const getJuryParticipantCountQuery = Effect.fn(
        "JuryQueries.getJuryParticipantCountQuery"
      )(function* ({
        invitationId,
        ratingFilter,
      }: {
        invitationId: number
        ratingFilter?: number[]
      }) {
        const invitation = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, invitationId),
        })

        if (!invitation) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation not found",
            })
          )
        }

        const conditions = [eq(submissions.marathonId, invitation.marathonId)]
        if (invitation.topicId) {
          conditions.push(eq(submissions.topicId, invitation.topicId))
        }
        let participantIds = yield* db
          .selectDistinct({ participantId: submissions.participantId })
          .from(submissions)
          .where(
            and(
              eq(submissions.marathonId, invitation.marathonId),
              invitation.topicId
                ? eq(submissions.topicId, invitation.topicId)
                : undefined,
              ...conditions
            )
          )

        if (ratingFilter && ratingFilter.length > 0) {
          const allRatings = yield* db.query.juryRatings.findMany({
            where: eq(juryRatings.invitationId, invitation.id),
          })

          const ratingMap = new Map()
          allRatings.forEach((rating) => {
            ratingMap.set(rating.participantId, rating.rating)
          })

          participantIds = participantIds.filter((participant) => {
            const rating = ratingMap.get(participant.participantId) || 0
            return ratingFilter.includes(rating)
          })
        }

        return { value: participantIds.length }
      })

      const getJuryInvitationStatisticsQuery = Effect.fn(
        "JuryQueries.getJuryInvitationStatisticsQuery"
      )(function* ({ invitationId }: { invitationId: number }) {
        const invitation = yield* db.query.juryInvitations.findFirst({
          where: eq(juryInvitations.id, invitationId),
        })

        if (!invitation) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation not found",
            })
          )
        }

        const invitationExpiry = new Date(invitation.expiresAt)
        if (invitationExpiry < new Date()) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Invitation expired",
            })
          )
        }

        const submissionConditions = [
          eq(submissions.marathonId, invitation.marathonId),
          eq(submissions.status, "uploaded"),
        ]

        if (
          invitation.competitionClassId !== null &&
          invitation.competitionClassId !== undefined
        ) {
          submissionConditions.push(
            eq(participants.competitionClassId, invitation.competitionClassId)
          )
        }

        if (
          invitation.deviceGroupId !== null &&
          invitation.deviceGroupId !== undefined
        ) {
          submissionConditions.push(
            eq(participants.deviceGroupId, invitation.deviceGroupId)
          )
        }

        if (invitation.topicId !== null && invitation.topicId !== undefined) {
          submissionConditions.push(eq(submissions.topicId, invitation.topicId))
        }

        const participantIds = yield* db
          .selectDistinct({ participantId: submissions.participantId })
          .from(submissions)
          .innerJoin(
            participants,
            eq(participants.id, submissions.participantId)
          )
          .where(and(...submissionConditions))

        const totalParticipants = participantIds.length

        const ratings = yield* db.query.juryRatings.findMany({
          where: and(
            eq(juryRatings.invitationId, invitation.id),
            eq(juryRatings.marathonId, invitation.marathonId)
          ),
          with: {
            participant: {
              columns: {
                id: true,
                reference: true,
                firstname: true,
                lastname: true,
              },
            },
          },
          orderBy: [desc(juryRatings.createdAt)],
        })

        const ratedParticipants = ratings.length
        const progressPercentage =
          totalParticipants > 0
            ? (ratedParticipants / totalParticipants) * 100
            : 0

        const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
          rating,
          count: ratings.filter((r) => r.rating === rating).length,
        }))

        const averageRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0

        return {
          totalParticipants,
          ratedParticipants,
          progressPercentage,
          averageRating,
          ratingDistribution,
          recentRatings: ratings.slice(0, 5),
        }
      })

      return {
        getJuryInvitationStatisticsQuery,
        getJuryParticipantCountQuery,
        getJuryRatingQuery,
        getJuryRatingsByInvitationQuery,
        getJurySubmissionsWithRatingFiltersQuery,
        createJuryRatingMutation,
        updateJuryRatingMutation,
        deleteJuryRatingMutation,
      }
    }),
  }
) {}
