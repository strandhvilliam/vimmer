import { EDITING_SOFTWARE_KEYWORDS, RULE_KEYS } from "../constants";
import type {
  ValidationInput,
  ValidationResult,
  ValidationFunction,
} from "../types";
import { createValidationResult } from "../utils";

function checkSoftware(input: ValidationInput): ValidationResult {
  const software = input.exif[RULE_KEYS.MODIFIED] as string | undefined;

  if (!software || software === "") {
    return createValidationResult(
      true,
      RULE_KEYS.MODIFIED,
      "No software used to edit the image"
    );
  }

  const hasEditingSoftwareKeyword = EDITING_SOFTWARE_KEYWORDS.some((keyword) =>
    software.toLowerCase().includes(keyword)
  );

  return hasEditingSoftwareKeyword
    ? createValidationResult(
        false,
        RULE_KEYS.MODIFIED,
        `Image was edited using photo editing software: ${software}`
      )
    : createValidationResult(
        true,
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
      true,
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
        false,
        RULE_KEYS.MODIFIED,
        "Image was likely edited"
      )
    : createValidationResult(
        true,
        RULE_KEYS.MODIFIED,
        "No timestamp inconsistencies for editing found"
      );
}

export const validate: ValidationFunction<typeof RULE_KEYS.MODIFIED> = (
  _,
  input
) => {
  return input.flatMap((singleInput) => [
    checkSoftware(singleInput),
    checkDateInconsistencies(singleInput),
  ]);
};
