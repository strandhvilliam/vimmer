import type { Handler, SQSEvent } from "aws-lambda";
import { createRule, runValidations } from "@vimmer/validation/validator";

import { createClient } from "@vimmer/supabase/lambda";
import {
  getParticipantByIdQuery,
  getRulesByMarathonIdQuery,
  getTopicsByDomainQuery,
  getTopicsByMarathonIdQuery,
} from "@vimmer/supabase/queries";
import { z } from "zod";
import { insertValidationResults } from "@vimmer/supabase/mutations";
import { RuleKey } from "@vimmer/validation/types";
import { RULE_KEYS } from "@vimmer/validation/constants";
import { SEVERITY_LEVELS } from "@vimmer/validation/constants";
import { RuleConfig } from "@vimmer/validation/types";
import type { RuleConfig as DbRuleConfig } from "@vimmer/supabase/types";

const defaultRuleConfigs: RuleConfig<RuleKey>[] = [
  createRule(RULE_KEYS.ALLOWED_FILE_TYPES, SEVERITY_LEVELS.ERROR, {
    allowedFileTypes: ["jpg", "jpeg"],
  }),
  createRule(RULE_KEYS.SAME_DEVICE, SEVERITY_LEVELS.ERROR),
  createRule(RULE_KEYS.WITHIN_TIMERANGE, SEVERITY_LEVELS.ERROR, {
    start: new Date("2023-01-01"),
    end: new Date("2026-01-01"),
  }),
  createRule(RULE_KEYS.SAME_DEVICE, SEVERITY_LEVELS.ERROR),
];

// Function to map database rule configs to validation rule configs
function mapDbRuleConfigsToValidationConfigs(
  dbRuleConfigs: DbRuleConfig[]
): RuleConfig<RuleKey>[] {
  return dbRuleConfigs
    .filter((rule) => rule.enabled) // Only include enabled rules
    .map((rule) => {
      const ruleKey = rule.ruleKey as RuleKey;
      const severity = rule.severity as "error" | "warning";

      return createRule(ruleKey, severity, rule.params as any);
    });
}

const validationInputSchema = z.object({
  exif: z.record(z.unknown(), { message: "No exif data found" }),
  fileName: z.string().min(1, { message: "File name is required" }),
  fileSize: z.number().nonnegative({ message: "File size is required" }),
  mimeType: z.string().min(1, { message: "Mime type is required" }),
  orderIndex: z.number().int().nonnegative(),
});

export const handler = async (event: SQSEvent): Promise<void> => {
  const records = event.Records;
  for (const record of records) {
    const parsedBody = JSON.parse(record.body) as { participantId: number };
    const participantId = parsedBody.participantId;

    if (!participantId) {
      throw new Error("Participant id is required");
    }

    const supabase = await createClient();

    const participantWithSubmissions = await getParticipantByIdQuery(
      supabase,
      participantId
    );

    if (!participantWithSubmissions) {
      //TODO: Add error NOT ABLE TO VALIDATE
      throw new Error(`Participant with id ${participantId} not found`);
    }

    if (
      participantWithSubmissions.status === "verified" ||
      participantWithSubmissions.status === "completed"
    ) {
      console.log("Participant is already verified or completed, skipping");
      continue;
    }

    const dbRuleConfigs = await getRulesByMarathonIdQuery(
      supabase,
      participantWithSubmissions.marathonId
    );

    // Map database rule configs to validation rule configs
    const ruleConfigs = mapDbRuleConfigsToValidationConfigs(dbRuleConfigs);

    const topics = await getTopicsByMarathonIdQuery(
      supabase,
      participantWithSubmissions.marathonId
    );

    const parsedSubmissions = z.array(validationInputSchema).safeParse(
      participantWithSubmissions.submissions.map((s) => ({
        exif: s.exif,
        fileName: s.key,
        fileSize: s.size,
        mimeType: s.mimeType,
        orderIndex: topics.find((t) => t.id === s.topicId)?.orderIndex,
      }))
    );

    if (!parsedSubmissions.success) {
      //TODO: Add error MISSING REQUIRED FIELDS
      throw new Error(`Invalid submissions: ${parsedSubmissions.error}`);
    }

    const validationResults = runValidations(
      ruleConfigs,
      parsedSubmissions.data
    ).map((r) => ({
      ...r,
      participantId,
    }));

    await insertValidationResults(supabase, validationResults);
  }
};
