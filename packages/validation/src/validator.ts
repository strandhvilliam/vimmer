import {
  checkModified,
  checkTimeframe,
  checkStrictTimestampOrdering,
  checkSameDevice,
  checkAllowedFileTypes,
  checkFileSize,
} from "./checks";
import { RULE_KEYS } from "./constants";

import type {
  RuleConfig,
  RuleKey,
  RuleParams,
  ValidationFunction,
  ValidationInput,
  ValidationResult,
} from "./types";
import { createValidationPipeline } from "./utils";

const validationFunctions: Record<RuleKey, ValidationFunction<any>> = {
  [RULE_KEYS.MAX_FILE_SIZE]: checkFileSize,
  [RULE_KEYS.ALLOWED_FILE_TYPES]: checkAllowedFileTypes,
  [RULE_KEYS.STRICT_TIMESTAMP_ORDERING]: checkStrictTimestampOrdering,
  [RULE_KEYS.SAME_DEVICE]: checkSameDevice,
  [RULE_KEYS.WITHIN_TIMERANGE]: checkTimeframe,
  [RULE_KEYS.MODIFIED]: checkModified,
};

function applyValidation<K extends RuleKey>(
  key: K,
  params: RuleParams[K],
  input: ValidationInput[]
): ValidationResult[] {
  const pipeline = createValidationPipeline(key);
  return pipeline(validationFunctions[key])(params, input);
}

export function runValidations(
  rules: RuleConfig<RuleKey>[],
  input: ValidationInput[]
): ValidationResult[] {
  return rules.flatMap((rule) => applyValidation(rule.key, rule.params, input));
}
