import { eq, and, desc } from "drizzle-orm";
import type { Database } from "@/db";
import {
  submissions,
  participants,
  marathons,
  juryInvitations,
} from "@/db/schema";
import type {
  Submission,
  Participant,
  CompetitionClass,
  DeviceGroup,
  Topic,
  JuryInvitation,
} from "@/db/types";
import type { SupabaseClient } from "@vimmer/supabase/types";

export interface JurySubmissionsResponse extends Submission {
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
  topic: Topic;
}

export async function getJurySubmissionsQuery(
  db: Database,
  filters: {
    domain: string;
    competitionClassId?: number | null;
    deviceGroupId?: number | null;
    topicId?: number | null;
  }
): Promise<JurySubmissionsResponse[]> {
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
): Promise<JuryInvitation[]> {
  const result = await db.query.juryInvitations.findMany({
    where: eq(juryInvitations.marathonId, id),
    orderBy: [desc(juryInvitations.createdAt)],
  });
  return result;
}

export async function getJuryInvitationByIdQuery(
  db: Database,
  { id }: { id: number }
): Promise<JuryInvitation | null> {
  const result = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, id),
  });
  return result ?? null;
}
