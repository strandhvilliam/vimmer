import { test, expect, describe } from "bun:test";
import { runValidations } from "./validator";
import { RULE_KEYS, VALIDATION_OUTCOME } from "./constants";
import type { RuleConfig } from "./types";
import { createMockInput } from "./utils";

describe("Validator integration tests", () => {
  test("should pass all validation rules for valid inputs", () => {
    const rules: RuleConfig<(typeof RULE_KEYS)[keyof typeof RULE_KEYS]>[] = [
      {
        key: RULE_KEYS.ALLOWED_FILE_TYPES,
        severity: "error",
        params: { allowedFileTypes: ["jpg", "jpeg", "png"] },
      },
      {
        key: RULE_KEYS.MAX_FILE_SIZE,
        severity: "error",
        params: { maxBytes: 10000000 }, // 10MB
      },
      {
        key: RULE_KEYS.MODIFIED,
        severity: "warning",
        params: {},
      },
      {
        key: RULE_KEYS.WITHIN_TIMERANGE,
        severity: "error",
        params: {
          start: new Date("2023-06-15T12:00:00Z"),
          end: new Date("2023-06-15T16:00:00Z"),
        },
      },
    ];

    const inputs = [
      createMockInput(),
      createMockInput({ orderIndex: 1 }),
      createMockInput({ orderIndex: 2 }),
    ];

    const results = runValidations(rules, inputs);

    // Check that all validation results are valid
    expect(
      results.every((result) => result.outcome === VALIDATION_OUTCOME.PASSED)
    ).toBe(true);
  });

  test("should detect validation errors for invalid inputs", () => {
    const rules: RuleConfig<(typeof RULE_KEYS)[keyof typeof RULE_KEYS]>[] = [
      {
        key: RULE_KEYS.ALLOWED_FILE_TYPES,
        severity: "error",
        params: { allowedFileTypes: ["jpg", "jpeg", "png"] },
      },
      {
        key: RULE_KEYS.MAX_FILE_SIZE,
        severity: "error",
        params: { maxBytes: 10000000 }, // 10MB
      },
      {
        key: RULE_KEYS.SAME_DEVICE,
        severity: "warning",
        params: {},
      },
    ];

    const inputs = [
      createMockInput(),
      createMockInput({
        orderIndex: 1,
        fileName: "test_image.bmp",
        mimeType: "image/bmp",
      }),
      createMockInput({
        orderIndex: 2,
        fileSize: 15000000, // 15MB
        exif: {
          ...createMockInput().exif,
          Make: "Canon",
          Model: "EOS R5",
        },
      }),
    ];

    const results = runValidations(rules, inputs);

    // Should have at least one invalid result
    expect(
      results.some((result) => result.outcome === VALIDATION_OUTCOME.FAILED)
    ).toBe(true);

    // Check specific validation errors
    const fileTypeErrors = results.filter(
      (r) =>
        r.ruleKey === RULE_KEYS.ALLOWED_FILE_TYPES &&
        r.outcome === VALIDATION_OUTCOME.FAILED
    );
    expect(fileTypeErrors.length).toBeGreaterThan(0);

    const fileSizeErrors = results.filter(
      (r) =>
        r.ruleKey === RULE_KEYS.MAX_FILE_SIZE &&
        r.outcome === VALIDATION_OUTCOME.FAILED
    );
    expect(fileSizeErrors.length).toBeGreaterThan(0);

    const deviceErrors = results.filter(
      (r) =>
        r.ruleKey === RULE_KEYS.SAME_DEVICE &&
        r.outcome === VALIDATION_OUTCOME.FAILED
    );
    expect(deviceErrors.length).toBeGreaterThan(0);
  });

  test("should handle multiple rule types in combination", () => {
    const rules: RuleConfig<(typeof RULE_KEYS)[keyof typeof RULE_KEYS]>[] = [
      {
        key: RULE_KEYS.ALLOWED_FILE_TYPES,
        severity: "error",
        params: { allowedFileTypes: ["jpg", "jpeg", "png"] },
      },
      {
        key: RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
        severity: "error",
        params: {},
      },
    ];

    const inputs = [
      createMockInput({
        orderIndex: 0,
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T15:00:00Z", // Later than second image
        },
      }),
      createMockInput({
        orderIndex: 1,
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T14:00:00Z", // Earlier than first image
        },
      }),
    ];

    const results = runValidations(rules, inputs);

    // Should have timestamp ordering errors
    const orderingErrors = results.filter(
      (r) =>
        r.ruleKey === RULE_KEYS.STRICT_TIMESTAMP_ORDERING &&
        r.outcome === VALIDATION_OUTCOME.FAILED
    );
    expect(orderingErrors.length).toBeGreaterThan(0);

    // But file type validation should pass
    const fileTypeResults = results.filter(
      (r) => r.ruleKey === RULE_KEYS.ALLOWED_FILE_TYPES
    );
    expect(
      fileTypeResults.every((r) => r.outcome === VALIDATION_OUTCOME.PASSED)
    ).toBe(true);
  });
});
