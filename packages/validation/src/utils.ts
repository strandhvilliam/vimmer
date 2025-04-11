import type {
  ExifData,
  RuleKey,
  RuleParams,
  SeverityLevel,
  ValidationFunction,
  ValidationInput,
} from "./types";
import type { ValidationResult } from "./types";
import { z } from "zod";
import { RULE_KEYS } from "./constants";

export const createValidationResult = (
  isValid: boolean,
  ruleKey: RuleKey,
  message: string
): ValidationResult => ({
  isValid,
  ruleKey,
  message,
  severity: "error",
});

export function withErrorHandling<K extends RuleKey>(
  ruleKey: K,
  validationFunction: ValidationFunction<K>
): ValidationFunction<K> {
  return (rule, input) => {
    try {
      return validationFunction(rule, input);
    } catch (error) {
      return [
        createValidationResult(false, ruleKey, "Unknown validation error"),
      ];
    }
  };
}

const ruleSchemas: Record<RuleKey, z.ZodSchema> = {
  [RULE_KEYS.ALLOWED_FILE_TYPES]: z.object({
    allowedFileTypes: z.array(z.string()).min(1),
  }),
  [RULE_KEYS.MAX_FILE_SIZE]: z.object({
    maxBytes: z.number().positive(),
  }),
  [RULE_KEYS.STRICT_TIMESTAMP_ORDERING]: z.object({}),
  [RULE_KEYS.SAME_DEVICE]: z.object({}),
  [RULE_KEYS.WITHIN_TIMERANGE]: z.object({
    start: z.union([z.string(), z.instanceof(Date)]),
    end: z.union([z.string(), z.instanceof(Date)]),
  }),
  [RULE_KEYS.MODIFIED]: z.object({}),
} as const;

function validateRuleParams<K extends RuleKey>(
  ruleKey: K,
  params: unknown
): [boolean, string?] {
  try {
    const schema = ruleSchemas[ruleKey];
    schema.parse(params);
    return [true];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      return [false, errorMessages.join("; ")];
    }
    return [false, "Invalid rule parameters"];
  }
}

export function withParamValidation<K extends RuleKey>(
  ruleKey: K,
  validationFunction: ValidationFunction<K>
): ValidationFunction<K> {
  return (rule, input) => {
    const [isValid, errorMessage] = validateRuleParams(ruleKey, rule);

    if (!isValid) {
      return [
        createValidationResult(
          false,
          ruleKey,
          `Invalid rule configuration: ${errorMessage}`
        ),
      ];
    }

    return validationFunction(rule, input);
  };
}

export const validationInputSchema = z.object({
  exif: z.record(z.unknown()),
  fileName: z.string().min(1),
  fileSize: z.number().nonnegative(),
  orderIndex: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
});

function validateInputs(inputs: unknown[]): [boolean, string?] {
  try {
    z.array(validationInputSchema).parse(inputs);
    return [true];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join(".");
        return `Item ${path}: ${err.message}`;
      });
      return [false, errorMessages.join("; ")];
    }
    return [false, "Invalid validation inputs"];
  }
}

export function withInputValidation<K extends RuleKey>(
  ruleKey: K,
  validationFunction: ValidationFunction<K>
): ValidationFunction<K> {
  return (rule, inputs) => {
    const [isValid, errorMessage] = validateInputs(inputs);

    if (!isValid) {
      return [
        createValidationResult(
          false,
          ruleKey,
          `Invalid input data: ${errorMessage}`
        ),
      ];
    }

    return validationFunction(rule, inputs);
  };
}

export function pipe<K extends RuleKey>(
  ...fns: Array<(fn: ValidationFunction<K>) => ValidationFunction<K>>
): (fn: ValidationFunction<K>) => ValidationFunction<K> {
  return (baseFunction: ValidationFunction<K>) => {
    return fns.reduceRight((acc, fn) => fn(acc), baseFunction);
  };
}

export function createValidationPipeline<K extends RuleKey>(
  ruleKey: K
): (fn: ValidationFunction<K>) => ValidationFunction<K> {
  return pipe(
    (fn) => withErrorHandling(ruleKey, fn),
    (fn) => withParamValidation(ruleKey, fn),
    (fn) => withInputValidation(ruleKey, fn)
  );
}

export function createMockInput(overrides = {}): ValidationInput {
  return {
    exif: {
      Make: "Sony",
      Model: "Alpha A7III",
      SerialNumber: "12345",
      DateTimeOriginal: "2023-06-15T14:30:00Z",
      CreateDate: "2023-06-15T14:30:00Z",
      ModifyDate: "2023-06-15T14:35:00Z",
      DateTime: "2023-06-15T14:35:00Z",
    },
    fileName: "test_image.jpg",
    fileSize: 5000000, // 5MB
    orderIndex: 0,
    mimeType: "image/jpeg",
    ...overrides,
  };
}
