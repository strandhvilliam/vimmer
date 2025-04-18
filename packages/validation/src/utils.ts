import type {
  ExifData,
  RuleKey,
  RuleParams,
  SeverityLevel,
  ValidationFunction,
  ValidationInput,
  ValidationOutcome,
} from "./types.js";
import type { ValidationResult } from "./types.js";
import { isValid, z } from "zod";
import { RULE_KEYS, VALIDATION_OUTCOME } from "./constants.js";

export const createValidationResult = (
  outcome: ValidationOutcome,
  ruleKey: RuleKey,
  message: string
): ValidationResult => ({
  outcome,
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
        createValidationResult(
          VALIDATION_OUTCOME.FAILED,
          ruleKey,
          "Unknown validation error"
        ),
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
    if (!schema) return [false, "Invalid rule key"];
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
          VALIDATION_OUTCOME.FAILED,
          ruleKey,
          `Invalid rule configuration: ${errorMessage}`
        ),
      ];
    }

    return validationFunction(rule, input);
  };
}

export const validationInputSchema = z.object({
  exif: z.record(z.unknown(), { message: "No exif data found" }),
  fileName: z.string().min(1, { message: "File name is required" }),
  fileSize: z.number().nonnegative({ message: "File size is required" }),
  orderIndex: z.number().int().nonnegative(),
  mimeType: z.string().min(1, { message: "Mime type is required" }),
});

function validateInput(input: unknown): [boolean, string?] {
  try {
    validationInputSchema.parse(input);
    return [true];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        return `${err.message}`;
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
  return (rule, input) => {
    const validationResults = input.reduce((acc, inp) => {
      const [isValid, errorMessage] = validateInput(inp);
      if (!isValid) {
        acc.push(
          attachFileName(
            createValidationResult(
              VALIDATION_OUTCOME.FAILED,
              ruleKey,
              errorMessage ?? "Invalid input data"
            ),
            inp
          )
        );
      }
      return acc;
    }, [] as ValidationResult[]);

    if (validationResults.length > 0) {
      return validationResults;
    }
    return validationFunction(rule, input);
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

export function attachFileName(
  result: ValidationResult,
  input: ValidationInput
): ValidationResult {
  console.log("attaching file name", result, input);
  return { ...result, fileName: input.fileName };
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
