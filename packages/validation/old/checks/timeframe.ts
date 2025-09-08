import { RULE_KEYS, VALIDATION_OUTCOME } from "../constants";
import type {
  RuleParams,
  ValidationFunction,
  ValidationInput,
  ValidationResult,
} from "../types";
import { attachFileName, createValidationResult } from "../utils";
import { format } from "date-fns";

function checkTimeframe(
  rule: RuleParams["within_timerange"],
  input: ValidationInput,
): ValidationResult {
  const start =
    typeof rule.start === "string" ? new Date(rule.start) : rule.start;
  const end = typeof rule.end === "string" ? new Date(rule.end) : rule.end;
  const { DateTimeOriginal, DateTimeDigitized, CreateDate } = input.exif;
  const timestamp = DateTimeOriginal || DateTimeDigitized || CreateDate;

  if (!timestamp) {
    return createValidationResult(
      VALIDATION_OUTCOME.SKIPPED,
      RULE_KEYS.WITHIN_TIMERANGE,
      "Unable to determine timestamp",
    );
  }

  const timestampDate =
    typeof timestamp === "string" ? new Date(timestamp) : (timestamp as Date);

  if (isNaN(timestampDate.getTime())) {
    return createValidationResult(
      VALIDATION_OUTCOME.FAILED,
      RULE_KEYS.WITHIN_TIMERANGE,
      "Invalid timestamp",
    );
  }

  if (timestampDate < start || timestampDate > end) {
    return createValidationResult(
      VALIDATION_OUTCOME.FAILED,
      RULE_KEYS.WITHIN_TIMERANGE,
      `Photo was taken outside of the specified timeframe (${format(start, "yyyy-MM-dd HH:mm")} - ${format(end, "yyyy-MM-dd HH:mm")})`,
    );
  }

  return createValidationResult(
    VALIDATION_OUTCOME.PASSED,
    RULE_KEYS.WITHIN_TIMERANGE,
    "Timestamp is within range of the specified timeframe",
  );
}

export const validate: ValidationFunction<typeof RULE_KEYS.WITHIN_TIMERANGE> = (
  rule,
  inputs,
) => {
  return inputs.map((input) =>
    attachFileName(checkTimeframe(rule, input), input),
  );
};
