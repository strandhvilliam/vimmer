import { eq, and, desc } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import {
  submissions,
  participants,
  marathons,
  juryInvitations,
} from "@vimmer/api/db/schema";
import type { NewJuryInvitation } from "@vimmer/api/db/types";

export async function getJurySubmissionsQuery(
  db: Database,
  filters: {
    domain: string;
    competitionClassId?: number | null;
    deviceGroupId?: number | null;
    topicId?: number | null;
  }
) {
  const marathon = await db
    .select({ id: marathons.id })
    .from(marathons)
    .where(eq(marathons.domain, filters.domain))
    .limit(1);

  if (!marathon.length) {
    return [];
  }

  const marathonId = marathon[0]!.id;

  const conditions = [
    eq(submissions.marathonId, marathonId),
    eq(submissions.status, "uploaded"),
  ];

  if (
    filters.competitionClassId !== null &&
    filters.competitionClassId !== undefined
  ) {
    conditions.push(
      eq(participants.competitionClassId, filters.competitionClassId)
    );
  }

  if (filters.deviceGroupId !== null && filters.deviceGroupId !== undefined) {
    conditions.push(eq(participants.deviceGroupId, filters.deviceGroupId));
  }

  if (filters.topicId !== null && filters.topicId !== undefined) {
    conditions.push(eq(submissions.topicId, filters.topicId));
  }

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

  return result;
}

export async function getJuryInvitationsByMarathonIdQuery(
  db: Database,
  { id }: { id: number }
) {
  const result = await db.query.juryInvitations.findMany({
    where: eq(juryInvitations.marathonId, id),
    orderBy: [desc(juryInvitations.createdAt)],
  });
  return result;
}

export async function getJuryInvitationByIdQuery(
  db: Database,
  { id }: { id: number }
) {
  const result = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, id),
  });
  return result ?? null;
}

export async function createJuryInvitationMutation(
  db: Database,
  { data }: { data: NewJuryInvitation }
) {
  const result = await db
    .insert(juryInvitations)
    .values(data)
    .returning({ id: juryInvitations.id });
  return result[0]?.id ?? null;
}

export async function updateJuryInvitationMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewJuryInvitation> }
) {
  const result = await db
    .update(juryInvitations)
    .set(data)
    .where(eq(juryInvitations.id, id))
    .returning({ id: juryInvitations.id });
  return result[0]?.id ?? null;
}

export async function deleteJuryInvitationMutation(
  db: Database,
  { id }: { id: number }
) {
  const result = await db
    .delete(juryInvitations)
    .where(eq(juryInvitations.id, id))
    .returning({ id: juryInvitations.id });
  return result[0]?.id ?? null;
}
