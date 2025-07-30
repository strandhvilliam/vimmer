import { eq, and } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import { sponsors } from "@vimmer/api/db/schema";
import { TRPCError } from "@trpc/server";

export type NewSponsor = {
  marathonId: number;
  type: string;
  position: string;
  key: string;
  uploadedAt?: string;
};

export async function getSponsorsByMarathonIdQuery(
  db: Database,
  { marathonId }: { marathonId: number },
) {
  const result = await db.query.sponsors.findMany({
    where: eq(sponsors.marathonId, marathonId),
  });
  return result;
}

export async function getSponsorsByTypeQuery(
  db: Database,
  { marathonId, type }: { marathonId: number; type: string },
) {
  const result = await db.query.sponsors.findMany({
    where: and(eq(sponsors.marathonId, marathonId), eq(sponsors.type, type)),
  });
  return result;
}

export async function getSponsorByIdQuery(
  db: Database,
  { id }: { id: number },
) {
  const result = await db.query.sponsors.findFirst({
    where: eq(sponsors.id, id),
  });
  return result ?? null;
}

export async function createSponsorMutation(
  db: Database,
  { data }: { data: NewSponsor },
) {
  const result = await db
    .insert(sponsors)
    .values({
      ...data,
      uploadedAt: data.uploadedAt || new Date().toISOString(),
    })
    .returning();

  if (!result[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create sponsor",
    });
  }

  return result[0];
}

export async function updateSponsorMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewSponsor> },
) {
  const updateData = {
    ...data,
    ...(data.key && { uploadedAt: new Date().toISOString() }),
  };

  const result = await db
    .update(sponsors)
    .set(updateData)
    .where(eq(sponsors.id, id))
    .returning();

  return result[0] ?? null;
}

export async function deleteSponsorMutation(
  db: Database,
  { id }: { id: number },
) {
  const result = await db
    .delete(sponsors)
    .where(eq(sponsors.id, id))
    .returning({ id: sponsors.id });

  return result[0]?.id ?? null;
}
