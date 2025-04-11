import { RULE_KEYS, IMAGE_EXTENSION_TO_MIME_TYPE } from "../constants";
import type {
  RuleParams,
  ValidationFunction,
  ValidationInput,
  ValidationResult,
} from "../types";
import { createValidationResult } from "../utils";

function getExtensionFromFilename(
  filename: string
): keyof typeof IMAGE_EXTENSION_TO_MIME_TYPE | null {
  const match = filename.match(/\.([^.]+)$/);
  const extension = match ? match[1].toLowerCase().replace(/^\./, "") : null;
  return extension as keyof typeof IMAGE_EXTENSION_TO_MIME_TYPE | null;
}

function checkIfValidExtension(
  rule: RuleParams["allowed_file_types"],
  input: ValidationInput
): ValidationResult {
  const extension = getExtensionFromFilename(input.fileName);

  if (!extension) {
    return createValidationResult(
      false,
      RULE_KEYS.ALLOWED_FILE_TYPES,
      "Unable to determine file extension"
    );
  }

  if (!rule.allowedFileTypes.includes(extension)) {
    return createValidationResult(
      false,
      RULE_KEYS.ALLOWED_FILE_TYPES,
      "Invalid file extension"
    );
  }

  return createValidationResult(
    true,
    RULE_KEYS.ALLOWED_FILE_TYPES,
    "Valid file extension"
  );
}

function checkIfValidMimeType(
  rule: RuleParams["allowed_file_types"],
  input: ValidationInput
): ValidationResult {
  const filteredMimeTypes = Object.entries(IMAGE_EXTENSION_TO_MIME_TYPE).filter(
    ([key, _]) => rule.allowedFileTypes.includes(key)
  );

  if (filteredMimeTypes.length === 0) {
    return createValidationResult(
      false,
      RULE_KEYS.ALLOWED_FILE_TYPES,
      "Invalid mime type"
    );
  }

  const isValidMimeType = filteredMimeTypes.some(
    ([_, value]) => value === input.mimeType
  );

  if (!isValidMimeType) {
    return createValidationResult(
      false,
      RULE_KEYS.ALLOWED_FILE_TYPES,
      "Invalid file mime type"
    );
  }

  return createValidationResult(
    true,
    RULE_KEYS.ALLOWED_FILE_TYPES,
    "Valid mime type"
  );
}

export const validate: ValidationFunction<
  typeof RULE_KEYS.ALLOWED_FILE_TYPES
> = (rule, input) => {
  return input.flatMap((singleInput) => [
    checkIfValidExtension(rule, singleInput),
    checkIfValidMimeType(rule, singleInput),
  ]);
};
