import { eq } from "drizzle-orm";
import type { Database, IdResponse } from "@/db";
import { validationResults, participantVerifications } from "@/db/schema";
import type {
  ValidationResult,
  ParticipantVerification,
  NewValidationResult,
  NewParticipantVerification,
  Participant,
  CompetitionClass,
  DeviceGroup,
} from "@/db/types";

interface ParticipantVerificationResponse extends ParticipantVerification {
  participant: Participant & {
    validationResults: ValidationResult[];
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
}

export async function getValidationResultsByParticipantIdQuery(
  db: Database,
  { participantId }: { participantId: number }
): Promise<ValidationResult[]> {
  const result = await db.query.validationResults.findMany({
    where: eq(validationResults.participantId, participantId),
  });

  return result;
}

export async function getParticipantVerificationsByStaffIdQuery(
  db: Database,
  { staffId }: { staffId: string }
): Promise<ParticipantVerificationResponse[]> {
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
): Promise<IdResponse> {
  const result = await db
    .insert(validationResults)
    .values(data)
    .returning({ id: validationResults.id });
  return { id: result[0]?.id ?? null };
}

export async function createMultipleValidationResultsMutation(
  db: Database,
  { data }: { data: NewValidationResult[] }
): Promise<IdResponse[]> {
  const result = await db
    .insert(validationResults)
    .values(data)
    .returning({ id: validationResults.id });
  return result.map((r) => ({ id: r.id }));
}

export async function updateValidationResultMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewValidationResult> }
): Promise<IdResponse | null> {
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
): Promise<IdResponse> {
  const result = await db
    .insert(participantVerifications)
    .values(data)
    .returning({ id: participantVerifications.id });
  return { id: result[0]?.id ?? null };
}
