import { eq, inArray, and, desc } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import {
  submissions,
  zippedSubmissions,
  marathons,
  participants,
} from "@vimmer/api/db/schema";
import type {
  NewSubmission,
  NewZippedSubmission,
  ZippedSubmission,
} from "@vimmer/api/db/types";

export async function getAllSubmissionKeysForMarathonQuery(
  db: Database,
  { marathonId }: { marathonId: number },
) {
  const result = await db.query.submissions.findMany({
    where: eq(submissions.marathonId, marathonId),
    columns: {
      key: true,
      thumbnailKey: true,
      previewKey: true,
    },
  });

  return result;
}

export async function getSubmissionByIdQuery(
  db: Database,
  { id }: { id: number },
) {
  const result = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
  });

  return result;
}

export async function getZippedSubmissionsByMarathonIdQuery(
  db: Database,
  { marathonId }: { marathonId: number },
) {
  const result = await db.query.zippedSubmissions.findMany({
    where: eq(zippedSubmissions.marathonId, marathonId),
  });

  return result;
}

export async function getManySubmissionsByKeysQuery(
  db: Database,
  { keys }: { keys: string[] },
) {
  const result = await db.query.submissions.findMany({
    where: inArray(submissions.key, keys),
  });

  return result;
}

export async function getSubmissionsByParticipantIdQuery(
  db: Database,
  { participantId }: { participantId: number },
) {
  const result = await db.query.submissions.findMany({
    where: eq(submissions.participantId, participantId),
  });

  return result;
}

export async function getSubmissionsForJuryQuery(
  db: Database,
  filters: {
    domain: string;
    competitionClassId?: number | null;
    deviceGroupId?: number | null;
    topicId?: number | null;
  },
) {
  const marathon = await db.query.marathons.findFirst({
    where: eq(marathons.domain, filters.domain),
  });

  if (!marathon) {
    return [];
  }

  const conditions = [
    eq(submissions.marathonId, marathon.id),
    eq(submissions.status, "uploaded"),
  ];

  // Note: For filtering by participant fields, we need to use a join or subquery
  // This is a simplified version - you might need to adjust based on your exact needs
  const result = await db.query.submissions.findMany({
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
  });

  // Filter by participant fields if needed
  let filteredResult = result;

  if (
    filters.competitionClassId !== null &&
    filters.competitionClassId !== undefined
  ) {
    filteredResult = filteredResult.filter(
      (s) =>
        (s.participant as any).competitionClassId ===
        filters.competitionClassId,
    );
  }

  if (filters.deviceGroupId !== null && filters.deviceGroupId !== undefined) {
    filteredResult = filteredResult.filter(
      (s) => (s.participant as any).deviceGroupId === filters.deviceGroupId,
    );
  }

  if (filters.topicId !== null && filters.topicId !== undefined) {
    filteredResult = filteredResult.filter(
      (s) => s.topicId === filters.topicId,
    );
  }

  return filteredResult;
}

export async function createSubmissionMutation(
  db: Database,
  { data }: { data: NewSubmission },
) {
  const result = await db
    .insert(submissions)
    .values(data)
    .returning({ id: submissions.id });
  return { id: result[0]?.id ?? null };
}

export async function createMultipleSubmissionsMutation(
  db: Database,
  { data }: { data: NewSubmission[] },
) {
  const result = await db
    .insert(submissions)
    .values(data)
    .returning({ id: submissions.id });
  return result.map((r) => ({ id: r.id }));
}

export async function updateSubmissionByKeyMutation(
  db: Database,
  { key, data }: { key: string; data: Partial<NewSubmission> },
) {
  const result = await db
    .update(submissions)
    .set(data)
    .where(eq(submissions.key, key))
    .returning({ id: submissions.id });
  return { id: result[0]?.id ?? null };
}

export async function updateSubmissionByIdMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewSubmission> },
) {
  const result = await db
    .update(submissions)
    .set(data)
    .where(eq(submissions.id, id))
    .returning({ id: submissions.id });
  return { id: result[0]?.id ?? null };
}

export async function createZippedSubmissionMutation(
  db: Database,
  { data }: { data: NewZippedSubmission },
): Promise<ZippedSubmission | null> {
  const result = await db.insert(zippedSubmissions).values(data).returning();
  return result?.[0] ?? null;
}

export async function updateZippedSubmissionMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewZippedSubmission> },
) {
  const result = await db
    .update(zippedSubmissions)
    .set(data)
    .where(eq(zippedSubmissions.id, id))
    .returning({ id: zippedSubmissions.id });
  return { id: result[0]?.id ?? null };
}

export async function getZippedSubmissionByParticipantRefQuery(
  db: Database,
  { domain, participantRef }: { domain: string; participantRef: string },
) {
  const participant = await db.query.participants.findFirst({
    where: and(
      eq(participants.domain, domain),
      eq(participants.reference, participantRef),
    ),
    with: {
      zippedSubmissions: true,
    },
  });

  if (!participant || !participant.zippedSubmissions) {
    return null;
  }

  return participant.zippedSubmissions;
}
