import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../db";
import { participants, submissions } from "@vimmer/api/db/schema";

export interface ParticipantWithDetails {
  id: number;
  reference: string;
  domain: string;
  status: string;
  competitionClassId: number | null;
  marathonId: number;
  createdAt: string;
  submissions: Array<{
    id: number;
    key: string;
    status: string;
    participantId: number;
  }>;
  competitionClass: {
    id: number;
    numberOfPhotos: number;
  } | null;
}

export async function getReadyToUploadParticipants(
  db: Database,
  domain: string,
  limit: number = 10,
  reference?: string,
): Promise<ParticipantWithDetails[]> {
  try {
    // Build where conditions
    const conditions = [eq(participants.domain, domain)];
    if (reference) {
      conditions.push(eq(participants.reference, reference));
    }

    // Use raw SQL approach to avoid relation issues
    const rawParticipants = await db
      .select({
        id: participants.id,
        reference: participants.reference,
        domain: participants.domain,
        status: participants.status,
        competitionClassId: participants.competitionClassId,
        marathonId: participants.marathonId,
        createdAt: participants.createdAt,
      })
      .from(participants)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(participants.createdAt));

    // Manually fetch submissions and competition class data
    const result: ParticipantWithDetails[] = [];

    for (const participant of rawParticipants) {
      // Get submissions for this participant
      const participantSubmissions = await db
        .select({
          id: submissions.id,
          key: submissions.key,
          status: submissions.status,
          participantId: submissions.participantId,
        })
        .from(submissions)
        .where(eq(submissions.participantId, participant.id));

      // Get competition class if exists
      let competitionClass = null;
      if (participant.competitionClassId) {
        const ccResult = await db.query.competitionClasses.findFirst({
          where: (competitionClasses, { eq }) =>
            eq(competitionClasses.id, participant.competitionClassId!),
          columns: {
            id: true,
            numberOfPhotos: true,
          },
        });
        competitionClass = ccResult || null;
      }

      result.push({
        ...participant,
        submissions: participantSubmissions,
        competitionClass,
      });
    }

    const latestByReference = getLatestParticipantsByReference(result);

    return latestByReference.slice(0, limit);
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw error;
  }
}

function getLatestParticipantsByReference(
  participants: any[],
): ParticipantWithDetails[] {
  const referenceMap = new Map<string, ParticipantWithDetails>();

  // First, check if any participant with each reference is already completed/verified
  const referenceStatus = new Map<string, string>();
  for (const participant of participants) {
    const currentStatus = referenceStatus.get(participant.reference);
    if (
      !currentStatus ||
      isHigherPriorityStatus(participant.status, currentStatus)
    ) {
      referenceStatus.set(participant.reference, participant.status);
    }
  }

  // Only include participants that need processing
  const filteredParticipants = participants.filter((participant) => {
    const bestStatus = referenceStatus.get(participant.reference);

    // If there's already a completed/verified participant, skip ready_to_upload ones
    if (bestStatus === "completed" || bestStatus === "verified") {
      return participant.status === bestStatus; // Only keep the completed/verified one
    }

    // Otherwise, keep the ready_to_upload participant
    return participant.status === "ready_to_upload";
  });

  console.log(
    `📋 Filtered ${participants.length} → ${filteredParticipants.length} participants (skipped already completed/verified)`,
  );

  // Get the latest participant for each reference from filtered list
  for (const participant of filteredParticipants) {
    const existing = referenceMap.get(participant.reference);
    if (
      !existing ||
      new Date(participant.createdAt) > new Date(existing.createdAt)
    ) {
      referenceMap.set(participant.reference, participant);
    }
  }

  return Array.from(referenceMap.values());
}

function isHigherPriorityStatus(status1: string, status2: string): boolean {
  const priority: Record<string, number> = {
    verified: 4,
    completed: 3,
    ready_to_upload: 2,
    initialized: 1,
  };

  return (priority[status1] || 0) > (priority[status2] || 0);
}

export async function updateSubmissionStatus(
  db: Database,
  submissionId: number,
  status: string,
): Promise<void> {
  await db
    .update(submissions)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(submissions.id, submissionId));
}

export async function updateParticipantStatus(
  db: Database,
  participantId: number,
  status: string,
): Promise<void> {
  await db
    .update(participants)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(participants.id, participantId));
}

export async function getAllParticipantsByReference(
  db: Database,
  reference: string,
  domain: string,
): Promise<
  Array<{ id: number; reference: string; status: string; createdAt: string }>
> {
  return await db
    .select({
      id: participants.id,
      reference: participants.reference,
      status: participants.status,
      createdAt: participants.createdAt,
    })
    .from(participants)
    .where(
      and(
        eq(participants.reference, reference),
        eq(participants.domain, domain),
      ),
    )
    .orderBy(desc(participants.createdAt));
}

export async function deleteParticipantById(
  db: Database,
  participantId: number,
): Promise<void> {
  await db.delete(participants).where(eq(participants.id, participantId));
}

export async function getSubmissionsByParticipantId(
  db: Database,
  participantId: number,
): Promise<Array<{ id: number; status: string }>> {
  return await db
    .select({
      id: submissions.id,
      status: submissions.status,
    })
    .from(submissions)
    .where(eq(submissions.participantId, participantId));
}

export async function getDetailedSubmissionsByParticipantId(
  db: Database,
  participantId: number,
): Promise<
  Array<{ id: number; key: string; status: string; topicId: number }>
> {
  return await db
    .select({
      id: submissions.id,
      key: submissions.key,
      status: submissions.status,
      topicId: submissions.topicId,
    })
    .from(submissions)
    .where(eq(submissions.participantId, participantId));
}

export async function updateSubmissionKey(
  db: Database,
  submissionId: number,
  newKey: string,
): Promise<void> {
  await db
    .update(submissions)
    .set({ key: newKey, updatedAt: new Date().toISOString() })
    .where(eq(submissions.id, submissionId));
}
