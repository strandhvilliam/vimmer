import { RULE_KEYS } from "../constants";
import type {
  RuleParams,
  ValidationFunction,
  ValidationInput,
  ValidationResult,
} from "../types";
import { createValidationResult } from "../utils";

function checkTimeframe(
  rule: RuleParams["within_timerange"],
  input: ValidationInput
): ValidationResult {
  const { start, end } = rule;
  const { DateTimeOriginal, DateTimeDigitized, CreateDate } = input.exif;
  const timestamp = DateTimeOriginal || DateTimeDigitized || CreateDate;

  if (!timestamp || typeof timestamp !== "string") {
    return createValidationResult(
      false,
      RULE_KEYS.WITHIN_TIMERANGE,
      "Unable to determine timestamp"
    );
  }

  const timestampDate = new Date(timestamp);

  if (timestampDate < start || timestampDate > end) {
    return createValidationResult(
      false,
      RULE_KEYS.WITHIN_TIMERANGE,
      "Timestamp is out of range of the specified timeframe"
    );
  }

  return createValidationResult(
    true,
    RULE_KEYS.WITHIN_TIMERANGE,
    "Timestamp is within range of the specified timeframe"
  );
}

export const validate: ValidationFunction<typeof RULE_KEYS.WITHIN_TIMERANGE> = (
  rule,
  input
) => {
  return input.map((singleInput) => checkTimeframe(rule, singleInput));
};
