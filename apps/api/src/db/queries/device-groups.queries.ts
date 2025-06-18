import type { Database, IdResponse } from "@/db";
import { deviceGroups, marathons } from "../schema";
import { eq } from "drizzle-orm";
import type { DeviceGroup, NewDeviceGroup } from "../types";

export async function getDeviceGroupByIdQuery(
  db: Database,
  { id }: { id: number }
): Promise<DeviceGroup | null> {
  const result = await db.query.deviceGroups.findFirst({
    where: eq(deviceGroups.id, id),
  });
  return result ?? null;
}

export async function getDeviceGroupsByDomainQuery(
  db: Database,
  { domain }: { domain: string }
): Promise<DeviceGroup[]> {
  const result = await db
    .select()
    .from(deviceGroups)
    .innerJoin(marathons, eq(deviceGroups.marathonId, marathons.id))
    .where(eq(marathons.domain, domain));

  return result.map((row) => row.device_groups);
}

export async function createDeviceGroup(
  db: Database,
  { data }: { data: NewDeviceGroup }
): Promise<IdResponse> {
  const result = await db
    .insert(deviceGroups)
    .values(data)
    .returning({ id: deviceGroups.id });
  return { id: result[0]?.id ?? null };
}

export async function updateDeviceGroup(
  db: Database,
  {
    id,
    data,
  }: {
    id: number;
    data: Partial<NewDeviceGroup>;
  }
): Promise<IdResponse> {
  const result = await db
    .update(deviceGroups)
    .set(data)
    .where(eq(deviceGroups.id, id))
    .returning({ id: deviceGroups.id });
  return { id: result[0]?.id ?? null };
}

export async function deleteDeviceGroup(
  db: Database,
  { id }: { id: number }
): Promise<IdResponse> {
  const result = await db
    .delete(deviceGroups)
    .where(eq(deviceGroups.id, id))
    .returning({ id: deviceGroups.id });
  return { id: result[0]?.id ?? null };
}
