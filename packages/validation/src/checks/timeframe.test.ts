import { test, expect, describe } from "bun:test";
import { validate as checkTimeframe } from "./timeframe.js";
import { createMockInput } from "../utils.js";
import { VALIDATION_OUTCOME } from "../constants.js";

describe("timeframe check", () => {
  test("should validate images within timeframe", () => {
    const input = [
      createMockInput({
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T14:30:00Z",
        },
      }),
    ];
    const rule = {
      start: new Date("2023-06-15T12:00:00Z"),
      end: new Date("2023-06-15T16:00:00Z"),
    };

    const results = checkTimeframe(rule, input);

    expect(results.length).toBe(1);
    expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.PASSED);
  });

  test("should detect images outside timeframe", () => {
    const input = [
      createMockInput({
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T11:30:00Z",
        },
      }),
    ];
    const rule = {
      start: new Date("2023-06-15T12:00:00Z"),
      end: new Date("2023-06-15T16:00:00Z"),
    };

    const results = checkTimeframe(rule, input);

    expect(results.length).toBe(1);
    expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED);
  });
});
