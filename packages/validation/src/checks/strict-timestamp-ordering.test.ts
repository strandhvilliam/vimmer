import { test, expect, describe } from "bun:test";
import { validate as checkStrictTimestampOrdering } from "./strict-timestamp-ordering";
import { createMockInput } from "../utils";
import { VALIDATION_OUTCOME } from "../constants";
describe("strict-timestamp-ordering check", () => {
  test("should validate correct timestamp ordering", () => {
    const input = [
      createMockInput({
        orderIndex: 0,
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T14:30:00Z",
        },
      }),
      createMockInput({
        orderIndex: 1,
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T14:45:00Z",
        },
      }),
      createMockInput({
        orderIndex: 2,
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T15:00:00Z",
        },
      }),
    ];
    const rule = {};

    const results = checkStrictTimestampOrdering(rule, input);

    expect(results.length).toBe(1);
    expect(results[0].outcome).toBe(VALIDATION_OUTCOME.PASSED);
  });

  test("should detect incorrect timestamp ordering", () => {
    const input = [
      createMockInput({
        orderIndex: 0,
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T15:00:00Z",
        },
      }),
      createMockInput({
        orderIndex: 1,
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T14:30:00Z",
        }, // Earlier than previous
      }),
      createMockInput({
        orderIndex: 2,
        exif: {
          ...createMockInput().exif,
          DateTimeOriginal: "2023-06-15T14:45:00Z",
        },
      }),
    ];
    const rule = {};

    const results = checkStrictTimestampOrdering(rule, input);

    expect(results.length).toBe(1);
    expect(results[0].outcome).toBe(VALIDATION_OUTCOME.FAILED);
  });
});
