import { test, expect, describe } from "bun:test";
import { validate as checkTimeframe } from "./timeframe";
import { createMockInput } from "../utils";

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
    expect(results[0].isValid).toBe(true);
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
    expect(results[0].isValid).toBe(false);
  });
});
