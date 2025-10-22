import { Data, Effect, Schema } from "effect"
import { EventBusDetailTypes, FinalizedEventSchema } from "@blikka/bus"
import { RuleKeySchema, ValidationRule, ValidationRuleSchema } from "@blikka/validation"
import { RuleConfig } from "@blikka/db"
import { EventBridgeEvent } from "@effect-aws/lambda"

export class InvalidBodyError extends Data.TaggedError("InvalidBodyError")<{
  message?: string
  cause?: unknown
}> {}

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  message?: string
  cause?: unknown
}> {}

export class InvalidDataFoundError extends Data.TaggedError("InvalidDataFoundError")<{
  message?: string
  cause?: unknown
}> {}

export class InvalidValidationRuleError extends Data.TaggedError("InvalidValidationRuleError")<{
  message?: string
  cause?: unknown
}> {}
