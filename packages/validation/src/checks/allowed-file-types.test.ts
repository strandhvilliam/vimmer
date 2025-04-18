import { test, expect, describe } from "bun:test";
import { validate as checkAllowedFileTypes } from "./allowed-file-types.js";
import { createMockInput } from "../utils.js";
import { VALIDATION_OUTCOME } from "../constants.js";

describe("allowed-file-types check", () => {
  test("should validate allowed file extensions", () => {
    const input = [createMockInput()];
    const rule = { allowedFileTypes: ["jpg", "jpeg", "png"] };

    const results = checkAllowedFileTypes(rule, input);

    expect(results.length).toBe(2); // Extension check and MIME type check
    expect(
      results.every((result) => result.outcome === VALIDATION_OUTCOME.PASSED)
    ).toBe(true);
  });

  test("should fail on disallowed file extensions", () => {
    const input = [createMockInput({ fileName: "test_image.bmp" })];
    const rule = { allowedFileTypes: ["jpg", "jpeg", "png"] };

    const results = checkAllowedFileTypes(rule, input);

    expect(
      results.some((result) => result.outcome === VALIDATION_OUTCOME.FAILED)
    ).toBe(true);
  });

  test("should fail on disallowed mime types", () => {
    const input = [createMockInput({ mimeType: "image/bmp" })];
    const rule = { allowedFileTypes: ["jpg", "jpeg", "png"] };

    const results = checkAllowedFileTypes(rule, input);

    expect(
      results.some((result) => result.outcome === VALIDATION_OUTCOME.FAILED)
    ).toBe(true);
  });
});
