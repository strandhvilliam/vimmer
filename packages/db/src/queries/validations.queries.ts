import { Effect } from "effect"
import { DrizzleClient } from "../drizzle-client"
import { and, eq, inArray, notInArray } from "drizzle-orm"
import {
  marathons,
  participantVerifications,
  validationResults,
} from "../schema"
import type {
  NewParticipantVerification,
  NewValidationResult,
  ValidationResult,
} from "../types"
import { SqlError } from "@effect/sql/SqlError"

export class ValidationsQueries extends Effect.Service<ValidationsQueries>()(
  "@blikka/db/validations-queries",
  {
    dependencies: [DrizzleClient.Default],
    effect: Effect.gen(function* () {
      const db = yield* DrizzleClient

      const getValidationResultsByParticipantIdQuery = Effect.fn(
        "ValidationsQueries.getValidationResultsByParticipantIdQuery"
      )(function* ({ participantId }: { participantId: number }) {
        const result = yield* db.query.validationResults.findMany({
          where: eq(validationResults.participantId, participantId),
        })

        return result
      })

      const getValidationResultsByDomainQuery = Effect.fn(
        "ValidationsQueries.getValidationResultsByDomainQuery"
      )(function* ({ domain }: { domain: string }) {
        const result = yield* db.query.marathons.findFirst({
          where: eq(marathons.domain, domain),
          with: {
            participants: {
              with: { submissions: true, validationResults: true },
            },
          },
        })

        return (
          result?.participants.flatMap((p) => {
            return p.submissions.map((s) => {
              const { submissions: _, validationResults: __, ...rest } = p
              return {
                ...s,
                participant: rest,
                globalValidationResults: p.validationResults.filter(
                  (vr) => !vr.fileName
                ),
                validationResults: p.validationResults.filter(
                  (vr) => vr.fileName === s.key
                ),
              }
            })
          }) ?? []
        )
      })

      const getParticipantVerificationsByStaffIdQuery = Effect.fn(
        "ValidationsQueries.getParticipantVerificationsByStaffIdQuery"
      )(function* ({ staffId, domain }: { staffId: string; domain: string }) {
        const result = yield* db.query.participantVerifications.findMany({
          where: eq(participantVerifications.staffId, staffId),
          with: {
            participant: {
              with: {
                competitionClass: true,
                deviceGroup: true,
                validationResults: true,
                submissions: true,
                marathon: true,
              },
            },
          },
          orderBy: (participantVerifications, { desc }) => [
            desc(participantVerifications.createdAt),
          ],
        })

        return result
          .filter((v) => v.participant.marathon.domain === domain)
          .map((v) => ({
            ...v,
            participant: { ...v.participant, marathon: undefined },
          }))
      })

      const createValidationResultMutation = Effect.fn(
        "ValidationsQueries.createValidationResultMutation"
      )(function* ({ data }: { data: NewValidationResult }) {
        const [result] = yield* db
          .insert(validationResults)
          .values(data)
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to create validation result",
            })
          )
        }

        return result
      })

      const createMultipleValidationResultsMutation = Effect.fn(
        "ValidationsQueries.createMultipleValidationResultsMutation"
      )(function* ({ data }: { data: NewValidationResult[] }) {
        const existingValidationResults =
          yield* db.query.validationResults.findMany({
            where: inArray(
              validationResults.participantId,
              data.map((d) => d.participantId)
            ),
          })

        const existingValidationResultsMap = new Map(
          existingValidationResults.map((r) => [
            r.fileName
              ? `${r.participantId}-${r.fileName}-${r.ruleKey}`
              : `${r.participantId}-${r.ruleKey}`,
            r,
          ])
        )

        const { toCreate, toUpdate } = data.reduce(
          (acc, d) => {
            const key = d.fileName
              ? `${d.participantId}-${d.fileName}-${d.ruleKey}`
              : `${d.participantId}-${d.ruleKey}`
            if (existingValidationResultsMap.has(key)) {
              acc.toUpdate.push({
                ...d,
                id: existingValidationResultsMap.get(key)?.id,
              })
            } else {
              acc.toCreate.push(d)
            }
            return acc
          },
          {
            toCreate: [] as NewValidationResult[],
            toUpdate: [] as NewValidationResult[],
          }
        )

        const result: ValidationResult[] = []
        if (toCreate.length > 0) {
          const created = yield* db
            .insert(validationResults)
            .values(toCreate)
            .returning()
          result.push(...created)
        }

        for (const r of toUpdate.filter((r) => r.id)) {
          if (!r.id) {
            continue
          }
          const updated = yield* updateValidationResultMutation({
            id: r.id,
            data: r,
          })
          result.push(updated)
        }

        return result
      })

      const updateValidationResultMutation = Effect.fn(
        "ValidationsQueries.updateValidationResultMutation"
      )(function* ({
        id,
        data,
      }: {
        id: number
        data: Partial<NewValidationResult>
      }) {
        const [result] = yield* db
          .update(validationResults)
          .set(data)
          .where(eq(validationResults.id, id))
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to update validation result",
            })
          )
        }
        return result
      })

      const createParticipantVerificationMutation = Effect.fn(
        "ValidationsQueries.createParticipantVerificationMutation"
      )(function* ({ data }: { data: NewParticipantVerification }) {
        const [result] = yield* db
          .insert(participantVerifications)
          .values(data)
          .returning()

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to create participant verification",
            })
          )
        }

        return result
      })

      const clearNonEnabledRuleResultsMutation = Effect.fn(
        "ValidationsQueries.clearNonEnabledRuleResultsMutation"
      )(function* ({
        participantId,
        ruleKeys,
      }: {
        participantId: number
        ruleKeys: string[]
      }) {
        yield* db
          .delete(validationResults)
          .where(
            and(
              eq(validationResults.participantId, participantId),
              notInArray(validationResults.ruleKey, ruleKeys)
            )
          )
      })

      const getAllParticipantVerificationsQuery = Effect.fn(
        "ValidationsQueries.getAllParticipantVerificationsQuery"
      )(function* ({
        domain,
        page,
        pageSize,
        search,
      }: {
        domain: string
        page: number
        pageSize: number
        search?: string
      }) {
        const offset = (page - 1) * pageSize

        const allVerifications =
          yield* db.query.participantVerifications.findMany({
            with: {
              participant: {
                with: {
                  competitionClass: true,
                  deviceGroup: true,
                  validationResults: true,
                  submissions: true,
                  marathon: true,
                },
              },
            },
            orderBy: (participantVerifications, { desc }) => [
              desc(participantVerifications.createdAt),
            ],
          })

        let filteredVerifications = allVerifications.filter(
          (v) => v.participant.marathon.domain === domain
        )

        if (search) {
          const lowerSearch = search.toLowerCase()
          filteredVerifications = filteredVerifications.filter((v) =>
            v.participant.reference.toLowerCase().includes(lowerSearch)
          )
        }

        const totalCount = filteredVerifications.length

        const paginatedResults = filteredVerifications
          .slice(offset, offset + pageSize)
          .map((v) => ({
            ...v,
            participant: { ...v.participant, marathon: undefined },
          }))

        return {
          data: paginatedResults,
          totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        }
      })

      const clearAllValidationResultsMutation = Effect.fn(
        "ValidationsQueries.clearAllValidationResultsMutation"
      )(function* ({ participantId }: { participantId: number }) {
        yield* db
          .delete(validationResults)
          .where(eq(validationResults.participantId, participantId))
      })

      return {
        getValidationResultsByParticipantIdQuery,
        getValidationResultsByDomainQuery,
        getParticipantVerificationsByStaffIdQuery,
        createValidationResultMutation,
        createMultipleValidationResultsMutation,
        updateValidationResultMutation,
        createParticipantVerificationMutation,
        clearNonEnabledRuleResultsMutation,
        getAllParticipantVerificationsQuery,
        clearAllValidationResultsMutation,
      }
    }),
  }
) {}
