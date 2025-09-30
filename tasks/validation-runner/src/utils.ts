import { Data, Effect, Schema } from "effect";
import { FinalizedEventSchema } from "@blikka/bus";
import {
  RuleKeySchema,
  ValidationRule,
  ValidationRuleSchema,
} from "@blikka/validation";
import { RuleConfig } from "@blikka/db";

export class InvalidBodyError extends Data.TaggedError("InvalidBodyError")<{
  message?: string;
  cause?: unknown;
}> {}

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  message?: string;
}> {}

export class InvalidDataFoundError extends Data.TaggedError(
  "InvalidDataFoundError",
)<{
  message?: string;
}> {}

export class InvalidValidationRuleError extends Data.TaggedError(
  "InvalidValidationRuleError",
)<{
  message?: string;
}> {}

export const parseFinalizedEvent = Effect.fn(
  "contactSheetGenerator.parseFinalizedEvent",
)(
  function* (input: string) {
    const json = yield* Effect.try({
      try: () => JSON.parse(input),
      catch: (unknown) =>
        new JsonParseError({ message: "Failed to parse JSON" }),
    });
    const params = yield* Schema.decodeUnknown(FinalizedEventSchema)(json);
    return params;
  },
  Effect.mapError(
    (error) =>
      new InvalidBodyError({
        message: "Failed to parse finalized event",
        cause: error,
      }),
  ),
);

export const makeValidationRules = Effect.fn("makeValidationRules")(
  function* (rules: RuleConfig[]) {
    const validationRules: ValidationRule[] = [];
    for (const rule of rules) {
      const validationRule = yield* Schema.decodeUnknown(RuleKeySchema)(
        rule.ruleKey,
      );
      const parsed = yield* Schema.decodeUnknown(
        ValidationRuleSchema(validationRule),
      )({
        ruleKey: validationRule,
        enabled: rule.enabled,
        severity: rule.severity,
        params: rule.params,
      });
      validationRules.push(parsed);
    }
    return validationRules;
  },
  Effect.mapError(
    (error) => new InvalidValidationRuleError({ message: error.message }),
  ),
);
