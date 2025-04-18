import { RULE_KEYS, VALIDATION_OUTCOME } from "../constants.js";
import type {
  RuleParams,
  ValidationFunction,
  ValidationInput,
  ValidationResult,
} from "../types.js";
import { attachFileName, createValidationResult } from "../utils.js";

function checkTimeframe(
  rule: RuleParams["within_timerange"],
  input: ValidationInput
): ValidationResult {
  const start =
    typeof rule.start === "string" ? new Date(rule.start) : rule.start;
  const end = typeof rule.end === "string" ? new Date(rule.end) : rule.end;
  const { DateTimeOriginal, DateTimeDigitized, CreateDate } = input.exif;
  const timestamp = DateTimeOriginal || DateTimeDigitized || CreateDate;

  console.log({ timestamp });

  if (!timestamp) {
    return createValidationResult(
      VALIDATION_OUTCOME.SKIPPED,
      RULE_KEYS.WITHIN_TIMERANGE,
      "Unable to determine timestamp"
    );
  }

  const timestampDate =
    typeof timestamp === "string" ? new Date(timestamp) : (timestamp as Date);

  if (isNaN(timestampDate.getTime())) {
    return createValidationResult(
      VALIDATION_OUTCOME.FAILED,
      RULE_KEYS.WITHIN_TIMERANGE,
      "Invalid timestamp"
    );
  }

  if (timestampDate < start || timestampDate > end) {
    return createValidationResult(
      VALIDATION_OUTCOME.FAILED,
      RULE_KEYS.WITHIN_TIMERANGE,
      `Timestamp is out of range of the specified timeframe: ${timestampDate.toISOString()} (allowed range: ${start.toISOString()} - ${end.toISOString()})`
    );
  }

  return createValidationResult(
    VALIDATION_OUTCOME.PASSED,
    RULE_KEYS.WITHIN_TIMERANGE,
    "Timestamp is within range of the specified timeframe"
  );
}

export const validate: ValidationFunction<typeof RULE_KEYS.WITHIN_TIMERANGE> = (
  rule,
  inputs
) => {
  return inputs.map((input) =>
    attachFileName(checkTimeframe(rule, input), input)
  );
};
