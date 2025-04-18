import {
  EDITING_SOFTWARE_KEYWORDS,
  RULE_KEYS,
  VALIDATION_OUTCOME,
} from "../constants.js";
import type {
  ValidationInput,
  ValidationResult,
  ValidationFunction,
} from "../types.js";
import { attachFileName, createValidationResult } from "../utils.js";

function checkSoftware(input: ValidationInput): ValidationResult {
  const software = input.exif[RULE_KEYS.MODIFIED] as string | undefined;

  if (!software || software === "") {
    return createValidationResult(
      VALIDATION_OUTCOME.PASSED,
      RULE_KEYS.MODIFIED,
      "No software used to edit the image"
    );
  }

  const hasEditingSoftwareKeyword = EDITING_SOFTWARE_KEYWORDS.some((keyword) =>
    software.toLowerCase().includes(keyword)
  );

  return hasEditingSoftwareKeyword
    ? createValidationResult(
        VALIDATION_OUTCOME.FAILED,
        RULE_KEYS.MODIFIED,
        `Detected usage of photo editing software: ${software}`
      )
    : createValidationResult(
        VALIDATION_OUTCOME.PASSED,
        RULE_KEYS.MODIFIED,
        "No software used to edit the image"
      );
}

function checkDateInconsistencies(input: ValidationInput): ValidationResult {
  const createDate = input.exif.DateTimeOriginal || input.exif.CreateDate;
  const modifyDate = input.exif.ModifyDate || input.exif.DateTime;

  if (
    !createDate ||
    !modifyDate ||
    typeof createDate !== "string" ||
    typeof modifyDate !== "string"
  ) {
    return createValidationResult(
      VALIDATION_OUTCOME.PASSED,
      RULE_KEYS.MODIFIED,
      "No timestamps found"
    );
  }

  const createTime = new Date(createDate).getTime();
  const modifyTime = new Date(modifyDate).getTime();

  // If modification date is more than 1 hour after creation date, likely edited
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const isEdited = modifyTime - createTime > ONE_HOUR_MS;

  return isEdited
    ? createValidationResult(
        VALIDATION_OUTCOME.FAILED,
        RULE_KEYS.MODIFIED,
        "Detected timestamp inconsistencies. Possible editing."
      )
    : createValidationResult(
        VALIDATION_OUTCOME.PASSED,
        RULE_KEYS.MODIFIED,
        "No timestamp inconsistencies for editing found"
      );
}

function checkLimitedExifData(input: ValidationInput): ValidationResult {
  const exifData = input.exif;

  // Count the number of meaningful EXIF properties
  // Ignore empty strings, null, undefined values
  const meaningfulProperties = Object.entries(exifData).filter(([_, value]) => {
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  });

  const propertyCount = meaningfulProperties.length;
  const MIN_EXPECTED_PROPERTIES = 15;

  if (propertyCount < MIN_EXPECTED_PROPERTIES) {
    return createValidationResult(
      VALIDATION_OUTCOME.FAILED,
      RULE_KEYS.MODIFIED,
      `Limited EXIF data detected (${propertyCount} properties). Possible editing or export from editing software.`
    );
  }

  return createValidationResult(
    VALIDATION_OUTCOME.PASSED,
    RULE_KEYS.MODIFIED,
    "Sufficient EXIF data properties present"
  );
}

export const validate: ValidationFunction<typeof RULE_KEYS.MODIFIED> = (
  _,
  inputs
) => {
  return inputs.flatMap((input) => [
    attachFileName(checkSoftware(input), input),
    attachFileName(checkDateInconsistencies(input), input),
    attachFileName(checkLimitedExifData(input), input),
  ]);
};
