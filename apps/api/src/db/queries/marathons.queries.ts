import { eq } from "drizzle-orm";
import type { Database, IdResponse } from "@/db";
import { marathons } from "@/db/schema";
import type {
  Marathon,
  CompetitionClass,
  DeviceGroup,
  Topic,
  NewMarathon,
} from "@/db/types";

interface MarathonResponse extends Marathon {
  competitionClasses: CompetitionClass[];
  deviceGroups: DeviceGroup[];
  topics: Topic[];
}

export async function getMarathonByIdQuery(
  db: Database,
  { id }: { id: number }
): Promise<MarathonResponse | null> {
  const result = await db.query.marathons.findFirst({
    where: eq(marathons.id, id),
    with: {
      competitionClasses: true,
      deviceGroups: true,
      topics: true,
    },
  });

  return result ?? null;
}

export async function getMarathonByDomainQuery(
  db: Database,
  { domain }: { domain: string }
): Promise<MarathonResponse | null> {
  const result = await db.query.marathons.findFirst({
    where: eq(marathons.domain, domain),
    with: {
      competitionClasses: true,
      deviceGroups: true,
      topics: true,
    },
  });

  return result ?? null;
}

export async function createMarathonMutation(
  db: Database,
  { data }: { data: NewMarathon }
): Promise<IdResponse> {
  const result = await db
    .insert(marathons)
    .values(data)
    .returning({ id: marathons.id });
  return { id: result[0]?.id ?? null };
}

export async function updateMarathonMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewMarathon> }
): Promise<IdResponse> {
  const result = await db
    .update(marathons)
    .set(data)
    .where(eq(marathons.id, id))
    .returning({ id: marathons.id });
  return { id: result[0]?.id ?? null };
}

export async function deleteMarathonMutation(
  db: Database,
  { id }: { id: number }
): Promise<IdResponse> {
  const result = await db
    .delete(marathons)
    .where(eq(marathons.id, id))
    .returning({ id: marathons.id });
  return { id: result[0]?.id ?? null };
}
