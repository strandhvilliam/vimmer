import type { Handler } from "aws-lambda";
import {
  createRule,
  RuleConfig,
  RuleKey,
  SEVERITY_LEVELS,
  RULE_KEYS,
  ValidationInput,
  ExifData,
  runValidations,
} from "@vimmer/validation";
import { createClient } from "@vimmer/supabase/lambda";
import { getParticipantByIdQuery } from "@vimmer/supabase/queries";
import { z } from "zod";
import { insertValidationResults } from "@vimmer/supabase/mutations";

const ruleConfigs: RuleConfig<RuleKey>[] = [
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

const validationInputSchema = z.object({
  exif: z.record(z.unknown(), { message: "No exif data found" }),
  fileName: z.string().min(1, { message: "File name is required" }),
  fileSize: z.number().nonnegative({ message: "File size is required" }),
  mimeType: z.string().min(1, { message: "Mime type is required" }),
  orderIndex: z.number().int().nonnegative(),
});

export const handler: Handler = async (event): Promise<void> => {
  const participantId = event.participantId;

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

  const parsedSubmissions = z.array(validationInputSchema).safeParse(
    participantWithSubmissions.submissions.map((s) => ({
      exif: s.exif,
      fileName: s.key,
      fileSize: s.size,
      mimeType: s.mimeType,
      orderIndex: s.topic.orderIndex,
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
};
