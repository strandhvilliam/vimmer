import { RULE_KEYS } from "../constants";
import {
  type RuleParams,
  type ValidationInput,
  type ValidationResult,
  type ValidationFunction,
} from "../types";
import { createValidationResult } from "../utils";

function checkFileSize(
  rule: RuleParams["max_file_size"],
  args: ValidationInput
): ValidationResult {
  if (args.fileSize > rule.maxBytes) {
    return createValidationResult(
      false,
      RULE_KEYS.MAX_FILE_SIZE,
      "File size is too large"
    );
  }
  return createValidationResult(
    true,
    RULE_KEYS.MAX_FILE_SIZE,
    "File size is valid"
  );
}

export const validate: ValidationFunction<typeof RULE_KEYS.MAX_FILE_SIZE> = (
  rule,
  input
) => {
  return input.map((singleInput) => checkFileSize(rule, singleInput));
};
