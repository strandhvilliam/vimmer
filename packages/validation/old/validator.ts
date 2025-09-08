import {
  checkModified,
  checkTimeframe,
  checkStrictTimestampOrdering,
  checkSameDevice,
  checkAllowedFileTypes,
  checkFileSize,
} from "./checks/index";

import { RULE_KEYS } from "./constants";
import type {
  RuleConfig,
  RuleKey,
  RuleParams,
  ValidationFunction,
  ValidationInput,
  ValidationResult,
  SeverityLevel,
} from "./types";

import { createValidationPipeline, pipe } from "./utils";

const validationFunctions: Record<RuleKey, ValidationFunction<any>> = {
  [RULE_KEYS.MAX_FILE_SIZE]: checkFileSize,
  [RULE_KEYS.ALLOWED_FILE_TYPES]: checkAllowedFileTypes,
  [RULE_KEYS.STRICT_TIMESTAMP_ORDERING]: checkStrictTimestampOrdering,
  [RULE_KEYS.SAME_DEVICE]: checkSameDevice,
  [RULE_KEYS.WITHIN_TIMERANGE]: checkTimeframe,
  [RULE_KEYS.MODIFIED]: checkModified,
};

function applyValidation<K extends RuleKey>(
  rule: RuleConfig<K>,
  input: ValidationInput[],
): ValidationResult[] {
  const pipeline = createValidationPipeline(rule.key);
  return pipeline(validationFunctions[rule.key])(rule.params, input);
}

function applySeverity<K extends RuleKey>(
  rule: RuleConfig<K>,
  results: ValidationResult,
): ValidationResult {
  return {
    ...results,
    severity: rule.severity,
  };
}

export function createRule<K extends RuleKey>(
  key: K,
  severity: SeverityLevel,
  params?: RuleParams[K],
): RuleConfig<K> {
  return {
    key,
    severity,
    params: params ?? ({} as RuleParams[K]),
  };
}

export function runValidations(
  rules: RuleConfig<RuleKey>[],
  input: ValidationInput[],
): ValidationResult[] {
  return rules.flatMap((rule) =>
    applyValidation(rule, input).map((result) => applySeverity(rule, result)),
  );
}
