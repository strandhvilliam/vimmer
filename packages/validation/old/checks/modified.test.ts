import { test, expect, describe } from "bun:test";
import { validate as checkModified } from "./modified";
import { RULE_KEYS, VALIDATION_OUTCOME } from "../constants";
import { createMockInput } from "../utils";

describe("modified check", () => {
  test("should validate unmodified images", () => {
    const input = [createMockInput()];
    const rule = {};

    const results = checkModified(rule, input);

    expect(
      results.every((result) => result.outcome === VALIDATION_OUTCOME.PASSED),
    ).toBe(true);
  });

  test("should detect image editing software", () => {
    const input = [
      createMockInput({
        exif: {
          ...createMockInput().exif,
          [RULE_KEYS.MODIFIED]: "Adobe Photoshop 2023",
        },
      }),
    ];
    const rule = {};

    const results = checkModified(rule, input);

    expect(
      results.some((result) => result.outcome === VALIDATION_OUTCOME.FAILED),
    ).toBe(true);
  });

  test("should detect timestamp inconsistencies", () => {
    const input = [
      createMockInput({
        exif: {
          ...createMockInput().exif,
          CreateDate: "2023-06-15T14:30:00Z",
          ModifyDate: "2023-06-15T16:30:00Z", // 2 hours later
        },
      }),
    ];
    const rule = {};

    const results = checkModified(rule, input);

    expect(
      results.some((result) => result.outcome === VALIDATION_OUTCOME.FAILED),
    ).toBe(true);
  });
});
