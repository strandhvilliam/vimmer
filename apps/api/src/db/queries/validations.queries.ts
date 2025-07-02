import { eq } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import {
  validationResults,
  participantVerifications,
  participants,
} from "@vimmer/api/db/schema";
import type {
  NewValidationResult,
  NewParticipantVerification,
} from "@vimmer/api/db/types";
import { TRPCError } from "@trpc/server";

export async function getValidationResultsByParticipantIdQuery(
  db: Database,
  { participantId }: { participantId: number }
) {
  const result = await db.query.validationResults.findMany({
    where: eq(validationResults.participantId, participantId),
  });

  return result;
}

export async function getParticipantVerificationsByStaffIdQuery(
  db: Database,
  { staffId }: { staffId: string }
) {
  const result = await db.query.participantVerifications.findMany({
    where: eq(participantVerifications.staffId, staffId),
    with: {
      participant: {
        with: {
          competitionClass: true,
          deviceGroup: true,
          validationResults: true,
        },
      },
    },
    orderBy: (participantVerifications, { desc }) => [
      desc(participantVerifications.createdAt),
    ],
  });

  return result;
}

export async function createValidationResultMutation(
  db: Database,
  { data }: { data: NewValidationResult }
) {
  const result = await db
    .insert(validationResults)
    .values(data)
    .returning({ id: validationResults.id });
  return { id: result[0]?.id ?? null };
}

export async function createMultipleValidationResultsMutation(
  db: Database,
  { data }: { data: NewValidationResult[] }
) {
  const result = await db
    .insert(validationResults)
    .values(data)
    .returning({ id: validationResults.id });
  return result.map((r) => ({ id: r.id }));
}

export async function updateValidationResultMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewValidationResult> }
) {
  const result = await db
    .update(validationResults)
    .set(data)
    .where(eq(validationResults.id, id))
    .returning({ id: validationResults.id });
  return { id: result[0]?.id ?? null };
}

export async function createParticipantVerificationMutation(
  db: Database,
  { data }: { data: NewParticipantVerification }
) {
  const result = await db
    .insert(participantVerifications)
    .values(data)
    .returning({ id: participantVerifications.id });

  if (!result[0]?.id) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create participant verification",
    });
  }

  return { id: result[0].id };
}
