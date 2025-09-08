import type {
  RULE_KEYS,
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
} from "./constants";

export type ValidationOutcome =
  (typeof VALIDATION_OUTCOME)[keyof typeof VALIDATION_OUTCOME];
export type RuleKey = (typeof RULE_KEYS)[keyof typeof RULE_KEYS];
export type SeverityLevel =
  (typeof SEVERITY_LEVELS)[keyof typeof SEVERITY_LEVELS];

export interface ExifData {
  [key: string]: unknown;
}

export interface ValidationResult {
  outcome: ValidationOutcome;
  ruleKey: RuleKey;
  message: string;
  fileName?: string;
  severity: SeverityLevel;
}

export interface RuleParams {
  [RULE_KEYS.ALLOWED_FILE_TYPES]: { allowedFileTypes: string[] };
  [RULE_KEYS.MAX_FILE_SIZE]: { maxBytes: number };
  [RULE_KEYS.STRICT_TIMESTAMP_ORDERING]: {};
  [RULE_KEYS.SAME_DEVICE]: {};
  [RULE_KEYS.WITHIN_TIMERANGE]: { start: string | Date; end: string | Date };
  [RULE_KEYS.MODIFIED]: {};
}

export interface ValidationInput {
  exif: ExifData;
  fileName: string;
  fileSize: number;
  orderIndex: number;
  mimeType: string;
}

export interface RuleConfig<K extends RuleKey> {
  key: K;
  severity: SeverityLevel;
  params: RuleParams[K];
}

export type ValidationFunction<K extends RuleKey> = (
  rule: RuleParams[K],
  input: ValidationInput[],
) => ValidationResult[];
