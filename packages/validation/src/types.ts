import type { RULE_KEYS } from "./constants";

export type RuleKey = (typeof RULE_KEYS)[keyof typeof RULE_KEYS];

export interface ExifData {
  [key: string]: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  ruleKey: RuleKey;
  message: string;
  filename?: string;
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

export type SeverityLevel = "error" | "warning";

export interface RuleConfig<K extends RuleKey> {
  key: K;
  level: SeverityLevel;
  params: RuleParams[K];
}

export type ValidationFunction<K extends RuleKey> = (
  rule: RuleParams[K],
  input: ValidationInput[]
) => ValidationResult[];
