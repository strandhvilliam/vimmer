import { RULE_KEYS, VALIDATION_OUTCOME } from "../constants";
import {
  type RuleParams,
  type ValidationInput,
  type ValidationResult,
  type ValidationFunction,
} from "../types";
import { attachFileName, createValidationResult } from "../utils";

function checkFileSize(
  rule: RuleParams["max_file_size"],
  input: ValidationInput
): ValidationResult {
  if (input.fileSize > rule.maxBytes) {
    return createValidationResult(
      VALIDATION_OUTCOME.FAILED,
      RULE_KEYS.MAX_FILE_SIZE,
      "File size is too large"
    );
  }
  return createValidationResult(
    VALIDATION_OUTCOME.PASSED,
    RULE_KEYS.MAX_FILE_SIZE,
    "File size is valid"
  );
}

export const validate: ValidationFunction<typeof RULE_KEYS.MAX_FILE_SIZE> = (
  rule,
  inputs
) => {
  return inputs.map((input) =>
    attachFileName(checkFileSize(rule, input), input)
  );
};
