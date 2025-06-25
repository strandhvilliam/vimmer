import { eq, and } from "drizzle-orm";
import type { Database, IdResponse } from "@/db";
import { ruleConfigs, marathons } from "@/db/schema";
import type { RuleConfig, NewRuleConfig } from "@/db/types";

export async function getRulesByMarathonIdQuery(
  db: Database,
  { marathonId }: { marathonId: number }
): Promise<RuleConfig[]> {
  const result = await db.query.ruleConfigs.findMany({
    where: eq(ruleConfigs.marathonId, marathonId),
  });

  return result;
}

export async function getRulesByDomainQuery(
  db: Database,
  { domain }: { domain: string }
): Promise<RuleConfig[]> {
  const result = await db.query.marathons.findFirst({
    where: eq(marathons.domain, domain),
    with: {
      ruleConfigs: true,
    },
  });

  return result?.ruleConfigs ?? [];
}

export async function getRuleConfigByMarathonIdAndRuleKeyQuery(
  db: Database,
  { marathonId, ruleKey }: { marathonId: number; ruleKey: string }
): Promise<RuleConfig | null> {
  const result = await db.query.ruleConfigs.findFirst({
    where: and(
      eq(ruleConfigs.marathonId, marathonId),
      eq(ruleConfigs.ruleKey, ruleKey)
    ),
  });

  return result ?? null;
}

export async function createRuleConfigMutation(
  db: Database,
  { data }: { data: NewRuleConfig }
): Promise<IdResponse> {
  const result = await db
    .insert(ruleConfigs)
    .values(data)
    .returning({ id: ruleConfigs.id });
  return { id: result[0]?.id ?? null };
}

export async function updateRuleConfigMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewRuleConfig> }
): Promise<IdResponse | null> {
  const result = await db
    .update(ruleConfigs)
    .set(data)
    .where(eq(ruleConfigs.id, id))
    .returning({ id: ruleConfigs.id });
  return { id: result[0]?.id ?? null };
}

export async function updateRuleConfigByMarathonIdAndRuleKeyMutation(
  db: Database,
  {
    marathonId,
    ruleKey,
    data,
  }: {
    marathonId: number;
    ruleKey: string;
    data: Partial<NewRuleConfig>;
  }
): Promise<IdResponse | null> {
  const result = await db
    .update(ruleConfigs)
    .set(data)
    .where(
      and(
        eq(ruleConfigs.marathonId, marathonId),
        eq(ruleConfigs.ruleKey, ruleKey)
      )
    )
    .returning({ id: ruleConfigs.id });
  return { id: result[0]?.id ?? null };
}

export async function deleteRuleConfigMutation(
  db: Database,
  { id }: { id: number }
): Promise<IdResponse | null> {
  const result = await db
    .delete(ruleConfigs)
    .where(eq(ruleConfigs.id, id))
    .returning({ id: ruleConfigs.id });
  return { id: result[0]?.id ?? null };
}

export async function deleteRuleConfigByMarathonIdAndRuleKeyMutation(
  db: Database,
  { marathonId, ruleKey }: { marathonId: number; ruleKey: string }
): Promise<IdResponse | null> {
  const result = await db
    .delete(ruleConfigs)
    .where(
      and(
        eq(ruleConfigs.marathonId, marathonId),
        eq(ruleConfigs.ruleKey, ruleKey)
      )
    )
    .returning({ id: ruleConfigs.id });
  return { id: result[0]?.id ?? null };
}
