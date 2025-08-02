import { eq, and } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import {
  participants,
  participantVerifications,
  submissions,
  validationResults,
  zippedSubmissions,
} from "@vimmer/api/db/schema";
import type { NewParticipant } from "@vimmer/api/db/types";
import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@vimmer/supabase/types";

export async function getParticipantByIdQuery(
  db: Database,
  { id }: { id: number },
) {
  const result = await db.query.participants.findFirst({
    where: eq(participants.id, id),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
      zippedSubmission: true,
    },
  });

  return result;
}

export async function getParticipantByReferenceQuery(
  db: Database,
  { reference, domain }: { reference: string; domain: string },
) {
  const result = await db.query.participants.findFirst({
    where: and(
      eq(participants.reference, reference),
      eq(participants.domain, domain),
    ),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
      zippedSubmission: true,
    },
  });

  if (!result) {
    return null;
  }

  return result;
}

export async function getParticipantsByDomainQuery(
  db: Database,
  { domain }: { domain: string },
) {
  const result = await db.query.participants.findMany({
    where: eq(participants.domain, domain),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
      zippedSubmission: true,
    },
  });

  return result;
}

export async function createParticipantMutation(
  db: Database,
  { data }: { data: NewParticipant },
): Promise<{ id: number }> {
  if (!data.domain) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Domain is required",
    });
  }

  let existingParticipant;
  try {
    existingParticipant = await getParticipantByReferenceQuery(db, {
      reference: data.reference,
      domain: data.domain,
    });
  } catch (error) {
    console.log("error", error);
  }

  if (existingParticipant) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Participant already exists",
    });
  }

  const result = await db
    .insert(participants)
    .values(data)
    .returning({ id: participants.id });

  if (!result[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create participant",
    });
  }

  return { id: result[0].id };
}

export async function updateParticipantMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewParticipant> },
): Promise<{ id: number }> {
  const result = await db
    .update(participants)
    .set(data)
    .where(eq(participants.id, id))
    .returning({ id: participants.id });

  if (!result[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update participant",
    });
  }

  return { id: result[0].id };
}

export async function deleteParticipantMutation(
  db: Database,
  { id }: { id: number },
): Promise<{ id: number }> {
  await db
    .delete(validationResults)
    .where(eq(validationResults.participantId, id));

  await db
    .delete(participantVerifications)
    .where(eq(participantVerifications.participantId, id));

  await db.delete(submissions).where(eq(submissions.participantId, id));
  await db
    .delete(zippedSubmissions)
    .where(eq(zippedSubmissions.participantId, id));

  await db.delete(participants).where(eq(participants.id, id));

  return { id };
}

export async function incrementUploadCounterMutation(
  supabase: SupabaseClient,
  {
    participantId,
    totalExpected,
  }: { participantId: number; totalExpected: number },
) {
  const resp = await supabase
    .rpc("increment_upload_counter", {
      participant_id: participantId,
      total_expected: totalExpected,
    })
    .throwOnError();

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
}
