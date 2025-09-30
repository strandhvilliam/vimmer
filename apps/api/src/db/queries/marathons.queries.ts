import { eq, inArray } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import {
  marathons,
  validationResults,
  participantVerifications,
  submissions,
  zippedSubmissions,
  participants,
  juryInvitations,
  topics,
  competitionClasses,
  deviceGroups,
  ruleConfigs,
  sponsors,
} from "@vimmer/api/db/schema";
import type { NewMarathon } from "@vimmer/api/db/types";
import { TRPCError } from "@trpc/server";

export async function getMarathonByIdQuery(
  db: Database,
  { id }: { id: number },
) {
  const result = await db.query.marathons.findFirst({
    where: eq(marathons.id, id),
  });

  return result ?? null;
}

export async function getMarathonByDomainQuery(
  db: Database,
  { domain }: { domain: string },
) {
  const result = await db.query.marathons.findFirst({
    where: eq(marathons.domain, domain),
  });

  return result;
}

export async function createMarathonMutation(
  db: Database,
  { data }: { data: NewMarathon },
) {
  const result = await db
    .insert(marathons)
    .values(data)
    .returning({ id: marathons.id });
  return result[0]?.id ?? null;
}

export async function updateMarathonMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewMarathon> },
) {
  const result = await db
    .update(marathons)
    .set(data)
    .where(eq(marathons.id, id))
    .returning({ id: marathons.id });
  return result[0]?.id ?? null;
}

export async function updateMarathonByDomainMutation(
  db: Database,
  { domain, data }: { domain: string; data: Partial<NewMarathon> },
) {
  if (!data.updatedAt) {
    data.updatedAt = new Date().toISOString();
  }

  const result = await db
    .update(marathons)
    .set(data)
    .where(eq(marathons.domain, domain))
    .returning({ id: marathons.id });
  return result[0]?.id ?? null;
}

export async function deleteMarathonMutation(
  db: Database,
  { id }: { id: number },
) {
  const result = await db
    .delete(marathons)
    .where(eq(marathons.id, id))
    .returning({ id: marathons.id });
  return result[0]?.id ?? null;
}

export async function resetMarathonMutation(
  db: Database,
  { id }: { id: number },
) {
  const marathon = await db.query.marathons.findFirst({
    where: eq(marathons.id, id),
  });

  if (!marathon) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Marathon with id ${id} not found`,
    });
  }

  const marathonParticipants = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.marathonId, id));

  const participantIds = marathonParticipants.map((p) => p.id);
  if (participantIds.length > 0) {
    await db
      .delete(validationResults)
      .where(inArray(validationResults.participantId, participantIds));
  }
  if (participantIds.length > 0) {
    await db
      .delete(participantVerifications)
      .where(inArray(participantVerifications.participantId, participantIds));
  }
  await db.delete(submissions).where(eq(submissions.marathonId, id));
  await db
    .delete(zippedSubmissions)
    .where(eq(zippedSubmissions.marathonId, id));
  await db.delete(participants).where(eq(participants.marathonId, id));
  await db.delete(juryInvitations).where(eq(juryInvitations.marathonId, id));
  await db.delete(topics).where(eq(topics.marathonId, id));
  await db
    .delete(competitionClasses)
    .where(eq(competitionClasses.marathonId, id));
  await db.delete(deviceGroups).where(eq(deviceGroups.marathonId, id));
  await db.delete(ruleConfigs).where(eq(ruleConfigs.marathonId, id));
  await db.delete(sponsors).where(eq(sponsors.marathonId, id));
  await db
    .update(marathons)
    .set({
      setupCompleted: false,
      updatedAt: new Date().toISOString(),
      startDate: null,
      endDate: null,
      name: "",
      description: null,
      logoUrl: null,
      languages: "en",
      termsAndConditionsKey: null,
    })
    .where(eq(marathons.id, id));

  return { id };
}
