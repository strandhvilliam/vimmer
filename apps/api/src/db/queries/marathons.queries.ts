import { eq } from "drizzle-orm";
import type { Database } from "@api/db";
import { marathons } from "@api/db/schema";
import type { NewMarathon } from "@api/db/types";
import { TRPCError } from "@trpc/server";

// export interface MarathonResponse extends Marathon {
//   competitionClasses: CompetitionClass[];
//   deviceGroups: DeviceGroup[];
//   topics: Topic[];
// }

export async function getMarathonByIdQuery(
  db: Database,
  { id }: { id: number }
) {
  const result = await db.query.marathons.findFirst({
    where: eq(marathons.id, id),
  });

  return result ?? null;
}

export async function getMarathonByDomainQuery(
  db: Database,
  { domain }: { domain: string }
) {
  const result = await db.query.marathons.findFirst({
    where: eq(marathons.domain, domain),
  });

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Marathon not found for domain ${domain}`,
    });
  }

  return result;
}

export async function createMarathonMutation(
  db: Database,
  { data }: { data: NewMarathon }
) {
  const result = await db
    .insert(marathons)
    .values(data)
    .returning({ id: marathons.id });
  return result[0]?.id ?? null;
}

export async function updateMarathonMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewMarathon> }
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
  { domain, data }: { domain: string; data: Partial<NewMarathon> }
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
  { id }: { id: number }
) {
  const result = await db
    .delete(marathons)
    .where(eq(marathons.id, id))
    .returning({ id: marathons.id });
  return result[0]?.id ?? null;
}
