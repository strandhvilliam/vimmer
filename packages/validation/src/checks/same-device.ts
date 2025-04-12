import { RULE_KEYS, VALIDATION_OUTCOME } from "../constants";
import type {
  ExifData,
  ValidationFunction,
  ValidationInput,
  ValidationResult,
} from "../types";
import { createValidationResult } from "../utils";

function getDeviceIdentifier(exif: ExifData): string | null {
  const { Make, Model, SerialNumber } = exif;

  if (Make && Model && typeof Make === "string" && typeof Model === "string") {
    return `${Make}-${Model}${SerialNumber && typeof SerialNumber === "string" ? `-${SerialNumber}` : ""}`;
  }

  if (Model && typeof Model === "string") {
    return Model;
  }

  return null;
}

function checkSameDevice(input: ValidationInput[]): ValidationResult {
  if (!input || input.length <= 1) {
    return createValidationResult(
      VALIDATION_OUTCOME.SKIPPED,
      RULE_KEYS.SAME_DEVICE,
      "Not enough images to compare devices"
    );
  }

  const deviceIdentifiers = input.map(({ exif }) => getDeviceIdentifier(exif));

  const validIdentifiers = deviceIdentifiers.filter(
    (identifier): identifier is string => identifier !== null
  );

  if (validIdentifiers.length === 0) {
    return createValidationResult(
      VALIDATION_OUTCOME.SKIPPED,
      RULE_KEYS.SAME_DEVICE,
      "No device information found"
    );
  }

  const firstIdentifier = validIdentifiers[0];
  const allSameDevice = validIdentifiers.every(
    (identifier) => identifier === firstIdentifier
  );

  return allSameDevice
    ? createValidationResult(
        VALIDATION_OUTCOME.PASSED,
        RULE_KEYS.SAME_DEVICE,
        "All images were taken with the same device"
      )
    : createValidationResult(
        VALIDATION_OUTCOME.FAILED,
        RULE_KEYS.SAME_DEVICE,
        "Images were taken with different devices"
      );
}

export const validate: ValidationFunction<typeof RULE_KEYS.SAME_DEVICE> = (
  _,
  input
) => {
  return [checkSameDevice(input)];
};
