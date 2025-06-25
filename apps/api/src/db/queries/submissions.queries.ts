import { eq, inArray, and } from "drizzle-orm";
import type { Database, IdResponse } from "@/db";
import {
  submissions,
  zippedSubmissions,
  marathons,
  participants,
} from "@/db/schema";
import type {
  Submission,
  ZippedSubmission,
  NewSubmission,
  NewZippedSubmission,
  Participant,
  CompetitionClass,
  DeviceGroup,
  Topic,
} from "@/db/types";
import type { SupabaseClient } from "@vimmer/supabase/types";

interface SubmissionForJuryResponse extends Submission {
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
  topic: Topic;
}

export async function getZippedSubmissionsByDomainQuery(
  db: Database,
  { marathonId }: { marathonId: number }
): Promise<ZippedSubmission[]> {
  const result = await db.query.zippedSubmissions.findMany({
    where: eq(zippedSubmissions.marathonId, marathonId),
  });

  return result;
}

export async function getManySubmissionsByKeysQuery(
  db: Database,
  { keys }: { keys: string[] }
): Promise<Submission[]> {
  const result = await db.query.submissions.findMany({
    where: inArray(submissions.key, keys),
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
  }
): Promise<SubmissionForJuryResponse[]> {
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
        (s.participant as any).competitionClassId === filters.competitionClassId
    );
  }

  if (filters.deviceGroupId !== null && filters.deviceGroupId !== undefined) {
    filteredResult = filteredResult.filter(
      (s) => (s.participant as any).deviceGroupId === filters.deviceGroupId
    );
  }

  if (filters.topicId !== null && filters.topicId !== undefined) {
    filteredResult = filteredResult.filter(
      (s) => s.topicId === filters.topicId
    );
  }

  return filteredResult;
}

export async function createSubmissionMutation(
  db: Database,
  { data }: { data: NewSubmission }
): Promise<IdResponse> {
  const result = await db
    .insert(submissions)
    .values(data)
    .returning({ id: submissions.id });
  return { id: result[0]?.id ?? null };
}

export async function createMultipleSubmissionsMutation(
  db: Database,
  { data }: { data: NewSubmission[] }
): Promise<IdResponse[]> {
  const result = await db
    .insert(submissions)
    .values(data)
    .returning({ id: submissions.id });
  return result.map((r) => ({ id: r.id }));
}

export async function updateSubmissionByKeyMutation(
  db: Database,
  { key, data }: { key: string; data: Partial<NewSubmission> }
): Promise<IdResponse | null> {
  const result = await db
    .update(submissions)
    .set(data)
    .where(eq(submissions.key, key))
    .returning({ id: submissions.id });
  return { id: result[0]?.id ?? null };
}

export async function updateSubmissionByIdMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewSubmission> }
): Promise<IdResponse | null> {
  const result = await db
    .update(submissions)
    .set(data)
    .where(eq(submissions.id, id))
    .returning({ id: submissions.id });
  return { id: result[0]?.id ?? null };
}

export async function incrementUploadCounterMutation(
  supabase: SupabaseClient,
  {
    participantId,
    totalExpected,
  }: { participantId: number; totalExpected: number }
): Promise<{
  uploadCount: number;
  status: string;
  isComplete: boolean;
}> {
  const { data } = await supabase
    .rpc("increment_upload_counter", {
      participant_id: participantId,
      total_expected: totalExpected,
    })
    .throwOnError();

  return data as {
    uploadCount: number;
    status: string;
    isComplete: boolean;
  };
}

export async function createZippedSubmissionMutation(
  db: Database,
  { data }: { data: NewZippedSubmission }
): Promise<IdResponse> {
  const result = await db
    .insert(zippedSubmissions)
    .values(data)
    .returning({ id: zippedSubmissions.id });
  return { id: result[0]?.id ?? null };
}

export async function updateZippedSubmissionMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewZippedSubmission> }
): Promise<IdResponse | null> {
  const result = await db
    .update(zippedSubmissions)
    .set(data)
    .where(eq(zippedSubmissions.id, id))
    .returning({ id: zippedSubmissions.id });
  return { id: result[0]?.id ?? null };
}
