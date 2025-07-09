import { and, eq, inArray, notInArray } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import {
  validationResults,
  participantVerifications,
  ruleConfigs,
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
          submissions: true,
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
  const existingValidationResults = await db.query.validationResults.findMany({
    where: inArray(
      validationResults.participantId,
      data.map((d) => d.participantId)
    ),
  });

  const existingValidationResultsMap = new Map(
    existingValidationResults.map((r) => [
      r.fileName
        ? `${r.participantId}-${r.fileName}-${r.ruleKey}`
        : `${r.participantId}-${r.ruleKey}`,
      r,
    ])
  );

  const { toCreate, toUpdate } = data.reduce(
    (acc, d) => {
      const key = d.fileName
        ? `${d.participantId}-${d.fileName}-${d.ruleKey}`
        : `${d.participantId}-${d.ruleKey}`;
      if (existingValidationResultsMap.has(key)) {
        acc.toUpdate.push({
          ...d,
          id: existingValidationResultsMap.get(key)?.id,
        });
      } else {
        acc.toCreate.push(d);
      }
      return acc;
    },
    {
      toCreate: [] as NewValidationResult[],
      toUpdate: [] as NewValidationResult[],
    }
  );

  const result: { id: number | null }[] = [];
  if (toCreate.length > 0) {
    const created = await db
      .insert(validationResults)
      .values(toCreate)
      .returning({ id: validationResults.id });
    result.push(...created);
  }

  for (const r of toUpdate.filter((r) => r.id)) {
    if (!r.id) {
      continue;
    }
    const updated = await updateValidationResultMutation(db, {
      id: r.id,
      data: r,
    });
    result.push(updated);
  }

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

export async function clearNonEnabledRuleResultsMutation(
  db: Database,
  { participantId, ruleKeys }: { participantId: number; ruleKeys: string[] }
) {
  await db
    .delete(validationResults)
    .where(
      and(
        eq(validationResults.participantId, participantId),
        notInArray(validationResults.ruleKey, ruleKeys)
      )
    );
}
