import React from "react";
import MaxFileSizeRule from "./_components/max-file-size-rule";
import AllowedFileTypesRule from "./_components/allowed-file-types-rule";
import WithinTimerangeRule from "./_components/within-timerange-rule";
import SameDeviceRule from "./_components/same-device-rule";
import NoModificationsRule from "./_components/no-modifications-rule";
import { RulesButtons } from "./_components/rules-buttons";
import StrictTimestampOrderingRule from "./_components/strict-timestamp-ordering-rule";
import { RulesProvider } from "./_components/rules-provider";
import { RulesFormValues } from "./_lib/schemas";
import {
  getMarathonByDomain,
  getRulesByMarathonId,
} from "@vimmer/supabase/cached-queries";
import { notFound } from "next/navigation";
import { RuleConfig } from "@vimmer/supabase/types";
import { RULE_KEYS } from "@vimmer/validation/constants";
import { RuleKey } from "@vimmer/validation/types";
import {
  allowedFileTypesParamsSchema,
  maxFileSizeParamsSchema,
  withinTimerangeParamsSchema,
} from "./_lib/schemas";
import { connection } from "next/server";

const DEFAULT_RULE_CONFIGS: RulesFormValues = {
  max_file_size: {
    enabled: false,
    severity: "error",
    params: {
      maxBytes: 1024 * 1024 * 5,
    },
  },
  allowed_file_types: {
    enabled: false,
    severity: "error",
    params: {
      allowedFileTypes: ["jpg"],
    },
  },
  within_timerange: {
    enabled: false,
    severity: "error",
    params: {
      start: "",
      end: "",
    },
  },
  same_device: {
    enabled: false,
    severity: "error",
    params: null,
  },
  modified: {
    enabled: false,
    severity: "error",
    params: null,
  },
  strict_timestamp_ordering: {
    enabled: false,
    severity: "error",
    params: null,
  },
};

function parseRuleWithParams<TParams>(
  rule: RuleConfig,
  schema: {
    safeParse: (params: unknown) => { success: boolean; data?: TParams };
  },
  key: keyof RulesFormValues,
  paramOverride?: Partial<TParams>
): Partial<RulesFormValues> {
  if (!rule.params) return {};
  const ok = schema.safeParse(rule.params);
  if (!ok.success) return {};
  return {
    [key]: {
      enabled: rule.enabled,
      severity: rule.severity,
      params: paramOverride ? { ...ok.data, ...paramOverride } : ok.data,
    },
  } as Partial<RulesFormValues>;
}

function parseSimpleRule(
  key: keyof RulesFormValues,
  rule: RuleConfig
): Partial<RulesFormValues> {
  return {
    [key]: {
      enabled: rule.enabled,
      severity: rule.severity,
      params: null,
    },
  };
}

function parseRules(
  rules: RuleConfig[],
  marathon: { startDate?: string; endDate?: string }
): RulesFormValues {
  let parsedRules: Partial<RulesFormValues> = {};

  const ruleHandlers: Record<
    RuleKey,
    (rule: RuleConfig) => Partial<RulesFormValues>
  > = {
    [RULE_KEYS.MAX_FILE_SIZE]: (rule) =>
      parseRuleWithParams(
        rule,
        maxFileSizeParamsSchema,
        RULE_KEYS.MAX_FILE_SIZE
      ),
    [RULE_KEYS.ALLOWED_FILE_TYPES]: (rule) =>
      parseRuleWithParams(
        rule,
        allowedFileTypesParamsSchema,
        RULE_KEYS.ALLOWED_FILE_TYPES
      ),
    [RULE_KEYS.WITHIN_TIMERANGE]: (rule) =>
      parseRuleWithParams(
        rule,
        withinTimerangeParamsSchema,
        RULE_KEYS.WITHIN_TIMERANGE,
        {
          start: marathon.startDate,
          end: marathon.endDate,
        }
      ),
    [RULE_KEYS.SAME_DEVICE]: (rule) =>
      parseSimpleRule(RULE_KEYS.SAME_DEVICE, rule),
    [RULE_KEYS.MODIFIED]: (rule) => parseSimpleRule(RULE_KEYS.MODIFIED, rule),
    [RULE_KEYS.STRICT_TIMESTAMP_ORDERING]: (rule) =>
      parseSimpleRule(RULE_KEYS.STRICT_TIMESTAMP_ORDERING, rule),
  };

  for (const rule of rules) {
    const isValidRuleKey = Object.values(RULE_KEYS).includes(
      rule.ruleKey as RuleKey
    );
    if (rule.ruleKey === RULE_KEYS.WITHIN_TIMERANGE) {
      console.log({ rule });
    }
    if (!isValidRuleKey) continue;
    const handler = ruleHandlers[rule.ruleKey as RuleKey];
    if (handler) {
      parsedRules = { ...parsedRules, ...handler(rule) };
    }
  }

  const defaultRulesWithMarathonDates = {
    ...DEFAULT_RULE_CONFIGS,
    within_timerange: {
      ...DEFAULT_RULE_CONFIGS.within_timerange,
      params: {
        start: marathon.startDate ?? "",
        end: marathon.endDate ?? "",
      },
    },
  };

  return {
    ...defaultRulesWithMarathonDates,
    ...parsedRules,
  };
}

export default async function RulesPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  await connection();
  const { domain } = await params;
  const marathon = await getMarathonByDomain(domain);
  if (!marathon) {
    return notFound();
  }
  const initialRules = await getRulesByMarathonId(marathon.id);

  const rules = parseRules(initialRules, {
    startDate: marathon.startDate ?? undefined,
    endDate: marathon.endDate ?? undefined,
  });

  return (
    <RulesProvider initialRules={rules}>
      <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-rocgrotesk">
              Rules
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Configure validation rules for photo submissions.
            </p>
          </div>
          <RulesButtons initialRules={rules} />
        </div>
        <div className="space-y-4">
          <MaxFileSizeRule />
          <AllowedFileTypesRule />
          <WithinTimerangeRule />
          <SameDeviceRule />
          <NoModificationsRule />
          <StrictTimestampOrderingRule />
        </div>
      </div>
    </RulesProvider>
  );
}
