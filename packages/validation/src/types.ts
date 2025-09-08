import { Data } from "effect"
import { RULE_KEYS } from "./constants"
import {
  RuleParamsSchema,
  SeverityLevelSchema,
  ValidationInputSchema,
  ValidationResultSchema,
} from "./schemas"

export class ValidationFailure extends Data.TaggedError("ValidationFailure")<{
  readonly ruleKey: RuleKey
  readonly message: string
  readonly context?: Record<string, unknown>
}> {}

export class ValidationSkipped extends Data.TaggedError("ValidationSkipped")<{
  readonly ruleKey: RuleKey
  readonly reason: string
}> {}

export type RuleKey = (typeof RULE_KEYS)[keyof typeof RULE_KEYS]

export type RuleParams = typeof RuleParamsSchema.Type

export type SeverityLevel = typeof SeverityLevelSchema.Type
export type ValidationInput = typeof ValidationInputSchema.Type
export type ValidationResult = typeof ValidationResultSchema.Type

export interface ValidationRule<K extends RuleKey = RuleKey> {
  ruleKey: K
  enabled: boolean
  severity: SeverityLevel
  params: RuleParams[K]
}
