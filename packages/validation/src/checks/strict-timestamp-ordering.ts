import { RULE_KEYS } from "../constants";
import type {
  ExifData,
  RuleParams,
  ValidationFunction,
  ValidationInput,
  ValidationResult,
} from "../types";
import { createValidationResult } from "../utils";

function getTimestamp(exif: ExifData): Date | null {
  const { DateTimeOriginal, DateTimeDigitized, CreateDate } = exif;

  const timestamp = DateTimeOriginal || DateTimeDigitized || CreateDate;

  if (!timestamp || typeof timestamp !== "string") {
    return null;
  }

  return new Date(timestamp);
}

function checkStrictTimestampOrdering(
  input: ValidationInput[]
): ValidationResult {
  if (!input || input.length <= 1) {
    return createValidationResult(
      true,
      RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
      "Not enough images to validate timestamp ordering"
    );
  }

  const timestampEntries = input
    .map(({ exif, orderIndex }) => ({
      orderIndex,
      timestamp: getTimestamp(exif),
    }))
    .filter(
      (entry): entry is { orderIndex: number; timestamp: Date } =>
        entry.timestamp !== null
    );

  if (timestampEntries.length < 2) {
    return createValidationResult(
      true,
      RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
      "Not enough images with valid timestamps to validate ordering"
    );
  }

  const sortedByTime = [...timestampEntries].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const isOrderCorrect = sortedByTime.every((entry, index) => {
    if (index === 0) return true;

    const prevEntry = sortedByTime[index - 1];
    return entry.orderIndex > prevEntry.orderIndex;
  });

  return isOrderCorrect
    ? createValidationResult(
        true,
        RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
        "Image order matches chronological timestamp order"
      )
    : createValidationResult(
        false,
        RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
        "Image order does not match chronological timestamp order"
      );
}

export const validate: ValidationFunction<
  typeof RULE_KEYS.STRICT_TIMESTAMP_ORDERING
> = (_, input) => {
  return [checkStrictTimestampOrdering(input)];
};
