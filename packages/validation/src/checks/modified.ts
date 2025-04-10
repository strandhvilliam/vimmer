import { EDITING_SOFTWARE_KEYWORDS } from "../constants";
import type { ExifData, ValidationResult } from "../types";
import { Parameter } from "../types";
import { createValidationResult } from "../utils";

function checkSoftware(exif: ExifData): ValidationResult {
  const software = exif[Parameter.SOFTWARE] as string | undefined;

  if (!software || software === "") {
    return createValidationResult(
      true,
      Parameter.SOFTWARE,
      "No software used to edit the image"
    );
  }

  const hasEditingSoftwareKeyword = EDITING_SOFTWARE_KEYWORDS.some((keyword) =>
    software.toLowerCase().includes(keyword)
  );

  return hasEditingSoftwareKeyword
    ? createValidationResult(
        false,
        Parameter.SOFTWARE,
        `Image was edited using photo editing software: ${software}`
      )
    : createValidationResult(
        true,
        Parameter.SOFTWARE,
        "No software used to edit the image"
      );
}

function checkDateInconsistencies(exif: ExifData): ValidationResult {
  const createDate = exif.DateTimeOriginal || exif.CreateDate;
  const modifyDate = exif.ModifyDate || exif.DateTime;

  if (
    !createDate ||
    !modifyDate ||
    typeof createDate !== "string" ||
    typeof modifyDate !== "string"
  ) {
    return createValidationResult(
      true,
      Parameter.TIMESTAMPS,
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
        Parameter.TIMESTAMPS,
        "Image was likely edited"
      )
    : createValidationResult(
        true,
        Parameter.TIMESTAMPS,
        "No timestamp inconsistencies for editing found"
      );
}

export function validate(exif: ExifData): ValidationResult[] {
  return [checkSoftware(exif), checkDateInconsistencies(exif)];
}
