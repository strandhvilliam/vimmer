import { Effect, Option } from "effect";
import { DrizzleClient } from "../drizzle-client";
import { participants } from "../schema";
import { eq, and, inArray, or, ilike, asc, desc, count } from "drizzle-orm";
import type { NewParticipant } from "../types";
import { SqlError } from "@effect/sql/SqlError";
import { SupabaseClient } from "../supabase-client";

export class ParticipantsQueries extends Effect.Service<ParticipantsQueries>()(
  "@blikka/db/participants-queries",
  {
    dependencies: [DrizzleClient.Default, SupabaseClient.Default],
    effect: Effect.gen(function* () {
      const db = yield* DrizzleClient;
      const supabase = yield* SupabaseClient;

      const getParticipantById = Effect.fn(
        "ParticipantsQueries.getParticipantByIdQuery",
      )(function* ({ id }: { id: number }) {
        const result = yield* db.query.participants.findFirst({
          where: eq(participants.id, id),
          with: {
            submissions: true,
            competitionClass: true,
            deviceGroup: true,
            validationResults: true,
            zippedSubmissions: true,
          },
        });

        return Option.fromNullable(result);
      });

      const getParticipantsWithoutSubmissions = Effect.fn(
        "ParticipantsQueries.getParticipantsWithoutSubmissionsQuery",
      )(function* ({ domain }: { domain: string }) {
        const result = yield* db.query.participants.findMany({
          where: eq(participants.domain, domain),
          with: {
            competitionClass: true,
            deviceGroup: true,
            zippedSubmissions: true,
          },
        });

        return result;
      });

      const getParticipantByReference = Effect.fn(
        "ParticipantsQueries.getParticipantByReferenceQuery",
      )(function* ({
        reference,
        domain,
      }: {
        reference: string;
        domain: string;
      }) {
        const result = yield* db.query.participants.findFirst({
          where: and(
            eq(participants.reference, reference),
            eq(participants.domain, domain),
          ),
          with: {
            submissions: {
              with: {
                topic: true,
              },
            },
            competitionClass: true,
            deviceGroup: true,
            validationResults: true,
            zippedSubmissions: true,
          },
        });

        return Option.fromNullable(result);
      });

      const getParticipantsByDomain = Effect.fn(
        "ParticipantsQueries.getParticipantsByDomainQuery",
      )(function* ({ domain }: { domain: string }) {
        const result = yield* db.query.participants.findMany({
          where: eq(participants.domain, domain),
          with: {
            competitionClass: true,
            deviceGroup: true,
          },
        });

        return result;
      });

      const getParticipantsByDomainPaginated = Effect.fn(
        "ParticipantsQueries.getParticipantsByDomainPaginatedQuery",
      )(function* ({
        domain,
        page,
        pageSize,
        search,
        status,
        competitionClassId,
        deviceGroupId,
        sortBy,
        sortOrder,
      }: {
        domain: string;
        page: number;
        pageSize: number;
        search?: string;
        status?: string | string[];
        competitionClassId?: number | number[];
        deviceGroupId?: number | number[];
        sortBy:
          | "createdAt"
          | "reference"
          | "firstname"
          | "lastname"
          | "uploadCount";
        sortOrder: "asc" | "desc";
      }) {
        const offset = (page - 1) * pageSize;

        const whereConditions = [eq(participants.domain, domain)];

        if (status) {
          if (Array.isArray(status)) {
            whereConditions.push(inArray(participants.status, status));
          } else {
            whereConditions.push(eq(participants.status, status));
          }
        }

        if (competitionClassId) {
          if (Array.isArray(competitionClassId)) {
            whereConditions.push(
              inArray(participants.competitionClassId, competitionClassId),
            );
          } else {
            whereConditions.push(
              eq(participants.competitionClassId, competitionClassId),
            );
          }
        }

        if (deviceGroupId) {
          if (Array.isArray(deviceGroupId)) {
            whereConditions.push(
              inArray(participants.deviceGroupId, deviceGroupId),
            );
          } else {
            whereConditions.push(eq(participants.deviceGroupId, deviceGroupId));
          }
        }

        if (search) {
          const searchPattern = `%${search}%`;
          const searchCondition = or(
            ilike(participants.reference, searchPattern),
            ilike(participants.firstname, searchPattern),
            ilike(participants.lastname, searchPattern),
            ilike(participants.email, searchPattern),
          );
          if (searchCondition) {
            whereConditions.push(searchCondition);
          }
        }

        const orderBy = [];
        if (sortBy === "createdAt") {
          orderBy.push(
            sortOrder === "asc"
              ? asc(participants.createdAt)
              : desc(participants.createdAt),
          );
        } else if (sortBy === "reference") {
          orderBy.push(
            sortOrder === "asc"
              ? asc(participants.reference)
              : desc(participants.reference),
          );
        } else if (sortBy === "firstname") {
          orderBy.push(
            sortOrder === "asc"
              ? asc(participants.firstname)
              : desc(participants.firstname),
          );
        } else if (sortBy === "lastname") {
          orderBy.push(
            sortOrder === "asc"
              ? asc(participants.lastname)
              : desc(participants.lastname),
          );
        } else if (sortBy === "uploadCount") {
          orderBy.push(
            sortOrder === "asc"
              ? asc(participants.uploadCount)
              : desc(participants.uploadCount),
          );
        }

        const totalCountResult = yield* db
          .select({ count: count() })
          .from(participants)
          .where(
            whereConditions.length > 0 ? and(...whereConditions) : undefined,
          );

        const totalCount = totalCountResult[0]?.count || 0;

        const result = yield* db.query.participants.findMany({
          where:
            whereConditions.length > 0 ? and(...whereConditions) : undefined,
          with: {
            submissions: true,
            competitionClass: true,
            deviceGroup: true,
            validationResults: true,
            zippedSubmissions: true,
          },
          orderBy,
          limit: pageSize,
          offset,
        });

        return {
          data: result,
          totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        };
      });

      const createParticipant = Effect.fn(
        "ParticipantsQueries.createParticipantMutation",
      )(function* ({ data }: { data: NewParticipant }) {
        if (!data.domain) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Domain is required",
            }),
          );
        }

        let existingParticipant;
        try {
          existingParticipant = yield* getParticipantByReference({
            reference: data.reference,
            domain: data.domain,
          });
        } catch (error) {
          console.log("error", error);
        }

        // if (existingParticipant) {
        //   throw new TRPCError({
        //     code: "BAD_REQUEST",
        //     message: "Participant already exists",
        //   });
        // }

        const [result] = yield* db
          .insert(participants)
          .values(data)
          .returning({ id: participants.id });

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to create participant",
            }),
          );
        }

        return result;
      });

      const updateParticipantById = Effect.fn(
        "ParticipantsQueries.updateParticipantMutation",
      )(function* ({
        id,
        data,
      }: {
        id: number;
        data: Partial<NewParticipant>;
      }) {
        const [result] = yield* db
          .update(participants)
          .set(data)
          .where(eq(participants.id, id))
          .returning({ id: participants.id });

        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to update participant",
            }),
          );
        }

        return result;
      });

      const updateParticipantByReference = Effect.fn(
        "ParticipantsQueries.updateParticipantByReference",
      )(function* ({
        reference,
        domain,
        data,
      }: {
        reference: string;
        domain: string;
        data: Partial<NewParticipant>;
      }) {
        const [result] = yield* db
          .update(participants)
          .set(data)
          .where(
            and(
              eq(participants.reference, reference),
              eq(participants.domain, domain),
            ),
          )
          .returning({ id: participants.id });
        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to update participant",
            }),
          );
        }
        return result;
      });

      const deleteParticipant = Effect.fn(
        "ParticipantsQueries.deleteParticipantMutation",
      )(function* ({ id }: { id: number }) {
        const [result] = yield* db
          .delete(participants)
          .where(eq(participants.id, id))
          .returning();
        if (!result) {
          return yield* Effect.fail(
            new SqlError({
              cause: "Failed to delete participant",
            }),
          );
        }
        return result;
      });

      const getVerifiedParticipantsWithCompletePreviewKeys = Effect.fn(
        "ParticipantsQueries.getVerifiedParticipantsWithCompletePreviewKeysQuery",
      )(function* ({ domain }: { domain: string }) {
        // Get all verified participants with their submissions
        const verifiedParticipants = yield* db.query.participants.findMany({
          where: and(
            eq(participants.domain, domain),
            eq(participants.status, "verified"),
          ),
          with: {
            submissions: {
              columns: {
                id: true,
                previewKey: true,
              },
            },
          },
          columns: {
            id: true,
            reference: true,
            firstname: true,
            lastname: true,
            contactSheetKey: true,
          },
        });

        const readyParticipants = verifiedParticipants.filter((participant) => {
          if (
            !participant.submissions ||
            participant.submissions.length === 0
          ) {
            return false;
          }

          if (participant.contactSheetKey !== null) {
            return false;
          }

          // All submissions must have preview keys
          return participant.submissions.every(
            (submission) => submission.previewKey,
          );
        });

        console.log(
          `Found ${verifiedParticipants.length} verified participants, ${readyParticipants.length} ready for bulk sheet generation`,
        );

        return readyParticipants;
      });

      const incrementUploadCounter = Effect.fn(
        "ParticipantsQueries.incrementUploadCounterMutation",
      )(function* ({
        participantId,
        totalExpected,
      }: {
        participantId: number;
        totalExpected: number;
      }) {
        const resp = yield* supabase.use((client) =>
          client
            .rpc("increment_upload_counter", {
              participant_id: participantId,
              total_expected: totalExpected,
            })
            .throwOnError(),
        );

        const data = resp.data as {
          upload_count: number;
          status: string;
          is_complete: boolean;
        };

        return {
          uploadCount: data.upload_count,
          status: data.status,
          isComplete: data.is_complete,
        };
      });

      return {
        getParticipantById,
        getParticipantsWithoutSubmissions,
        getParticipantByReference,
        getParticipantsByDomain,
        getParticipantsByDomainPaginated,
        createParticipant,
        updateParticipantById,
        updateParticipantByReference,
        deleteParticipant,
        getVerifiedParticipantsWithCompletePreviewKeys,
        incrementUploadCounter,
      };
    }),
  },
) {}
