import { eq } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import { ruleConfigs, marathons } from "@vimmer/api/db/schema";

import type { NewRuleConfig, RuleConfig } from "@vimmer/api/db/types";
import { TRPCError } from "@trpc/server";

function getDefaultRuleConfigs(marathonId: number): NewRuleConfig[] {
  return [
    {
      ruleKey: "max_file_size",
      marathonId,
      enabled: false,
      severity: "error",
      params: {
        maxBytes: 1024 * 1024 * 5,
      },
    },
    {
      ruleKey: "allowed_file_types",
      marathonId,
      enabled: false,
      severity: "error",
      params: {
        allowedFileTypes: ["jpg"],
      },
    },
    {
      ruleKey: "within_timerange",
      marathonId,
      enabled: false,
      severity: "error",
      params: {
        start: "",
        end: "",
      },
    },
    {
      ruleKey: "same_device",
      marathonId,
      enabled: false,
      severity: "error",
      params: null,
    },
    {
      ruleKey: "modified",
      marathonId,
      enabled: false,
      severity: "error",
      params: null,
    },
    {
      ruleKey: "strict_timestamp_ordering",
      marathonId,
      enabled: false,
      severity: "error",
      params: null,
    },
  ];
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

  const rules = result?.ruleConfigs ?? [];

  if (rules.length === 0 && result?.id) {
    await db.insert(ruleConfigs).values(getDefaultRuleConfigs(result.id));
    const newResult = await db.query.marathons.findFirst({
      where: eq(marathons.id, result.id),
      with: {
        ruleConfigs: true,
      },
    });
    if (!newResult) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get rules",
      });
    }
    return newResult.ruleConfigs;
  }
  if (rules.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get rules",
    });
  }

  return rules;
}

export async function createRuleConfigMutation(
  db: Database,
  { data }: { data: NewRuleConfig }
) {
  const result = await db
    .insert(ruleConfigs)
    .values(data)
    .returning({ id: ruleConfigs.id });
  return { id: result[0]?.id ?? null };
}

export async function updateRuleConfigMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewRuleConfig> }
) {
  const result = await db
    .update(ruleConfigs)
    .set(data)
    .where(eq(ruleConfigs.id, id))
    .returning({ id: ruleConfigs.id });
  return { id: result[0]?.id ?? null };
}

export async function updateMultipleRuleConfigMutation(
  db: Database,
  { data }: { data: NewRuleConfig[] }
) {
  const promises = [];
  for (const rule of data) {
    if (rule.id) {
      promises.push(
        db.update(ruleConfigs).set(rule).where(eq(ruleConfigs.id, rule.id))
      );
    }
  }
  await Promise.all(promises);
  return { success: true };
}

export async function deleteRuleConfigMutation(
  db: Database,
  { id }: { id: number }
) {
  const result = await db
    .delete(ruleConfigs)
    .where(eq(ruleConfigs.id, id))
    .returning({ id: ruleConfigs.id });
  return { id: result[0]?.id ?? null };
}
