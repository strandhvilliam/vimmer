import { eq, and } from "drizzle-orm";
import type { Database, IdResponse } from "@/db";
import { participants } from "@/db/schema";
import type {
  Participant,
  Submission,
  CompetitionClass,
  DeviceGroup,
  ValidationResult,
  NewParticipant,
} from "@/db/types";

interface ParticipantResponse extends Participant {
  submissions: Submission[];
  competitionClass: CompetitionClass | null;
  deviceGroup: DeviceGroup | null;
  validationResults: ValidationResult[];
}

export async function getParticipantByIdQuery(
  db: Database,
  { id }: { id: number }
): Promise<ParticipantResponse | null> {
  const result = await db.query.participants.findFirst({
    where: eq(participants.id, id),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
    },
  });

  return result ?? null;
}

export async function getParticipantByReferenceQuery(
  db: Database,
  { reference, domain }: { reference: string; domain: string }
): Promise<ParticipantResponse | null> {
  const result = await db.query.participants.findFirst({
    where: and(
      eq(participants.reference, reference),
      eq(participants.domain, domain)
    ),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
    },
  });

  return result ?? null;
}

export async function getParticipantsByDomainQuery(
  db: Database,
  { domain }: { domain: string }
): Promise<ParticipantResponse[]> {
  const result = await db.query.participants.findMany({
    where: eq(participants.domain, domain),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
    },
  });

  return result;
}

export async function createParticipantMutation(
  db: Database,
  { data }: { data: NewParticipant }
): Promise<IdResponse> {
  const result = await db
    .insert(participants)
    .values(data)
    .returning({ id: participants.id });
  return { id: result[0]?.id ?? null };
}

export async function updateParticipantMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewParticipant> }
): Promise<IdResponse | null> {
  const result = await db
    .update(participants)
    .set(data)
    .where(eq(participants.id, id))
    .returning({ id: participants.id });
  return { id: result[0]?.id ?? null };
}

export async function deleteParticipantMutation(
  db: Database,
  { id }: { id: number }
): Promise<IdResponse | null> {
  const result = await db
    .delete(participants)
    .where(eq(participants.id, id))
    .returning({ id: participants.id });
  return { id: result[0]?.id ?? null };
}
