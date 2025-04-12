import { test, expect, describe } from "bun:test";
import { validate as checkSameDevice } from "./same-device";
import { createMockInput } from "../utils";
import { VALIDATION_OUTCOME } from "../constants";

describe("same-device check", () => {
  test("should validate images from same device", () => {
    const input = [
      createMockInput(),
      createMockInput({ orderIndex: 1 }),
      createMockInput({ orderIndex: 2 }),
    ];
    const rule = {};

    const results = checkSameDevice(rule, input);

    expect(results.length).toBe(1);
    expect(results[0].outcome).toBe(VALIDATION_OUTCOME.PASSED);
  });

  test("should detect images from different devices", () => {
    const input = [
      createMockInput(),
      createMockInput({
        orderIndex: 1,
        exif: {
          ...createMockInput().exif,
          Make: "Canon",
          Model: "EOS R5",
        },
      }),
      createMockInput({ orderIndex: 2 }),
    ];
    const rule = {};

    const results = checkSameDevice(rule, input);

    expect(results.length).toBe(1);
    expect(results[0].outcome).toBe(VALIDATION_OUTCOME.FAILED);
  });
});
