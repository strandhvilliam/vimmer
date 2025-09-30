import { test, expect, describe } from "bun:test"
import { Effect } from "effect"
import { ValidationEngine } from "./validation-engine"
import { SingleValidationsService } from "./single-validations-service"
import { GroupedValidationsService } from "./grouped-validations-service"
import { RULE_KEYS, VALIDATION_OUTCOME } from "./constants"
import type { ValidationInput, ValidationRule } from "./types"

function createMockInput(
  overrides?: Partial<ValidationInput>
): ValidationInput {
  return {
    fileName: "test_image.jpg",
    fileSize: 5000000,
    orderIndex: 0,
    mimeType: "image/jpeg",
    exif: {
      Make: "Sony",
      Model: "ILCE-7M3",
      DateTimeOriginal: "2023-06-15T14:30:00Z",
      CreateDate: "2023-06-15T14:30:00Z",
      ModifyDate: "2023-06-15T14:30:00Z",
      Software: "",
      FNumber: 2.8,
      ExposureTime: "1/125",
      ISO: 400,
      LensModel: "FE 24-70mm F2.8 GM",
      FocalLength: "50mm",
      Flash: "Off",
      WhiteBalance: "Auto",
      ColorSpace: "sRGB",
      ExifImageWidth: 6000,
      ExifImageHeight: 4000,
      Compression: "JPEG",
      Orientation: 1,
    },
    ...overrides,
  }
}

const runProgram = <A, E = never, R = never>(program: Effect.Effect<A, E, R>) =>
  Effect.runPromise(
    program.pipe(
      Effect.provide(SingleValidationsService.Default),
      Effect.provide(GroupedValidationsService.Default),
      Effect.provide(ValidationEngine.Default)
    ) as Effect.Effect<A, E, never>
  )

describe("ValidationEngine", () => {
  describe("executeRule - MAX_FILE_SIZE", () => {
    test("should pass when file size is within limit", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.MAX_FILE_SIZE,
        enabled: true,
        severity: "error",
        params: { max_file_size: { maxBytes: 10000000 } },
      }

      const inputs = [createMockInput({ fileSize: 5000000 })]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
      expect(results[0]?.ruleKey).toBe(RULE_KEYS.MAX_FILE_SIZE)
    })

    test("should fail when file size exceeds limit", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.MAX_FILE_SIZE,
        enabled: true,
        severity: "error",
        params: { max_file_size: { maxBytes: 5000000 } },
      }

      const inputs = [createMockInput({ fileSize: 10000000 })]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[0]?.ruleKey).toBe(RULE_KEYS.MAX_FILE_SIZE)
      expect(results[0]?.message).toContain("File size is too large")
    })

    test("should validate multiple inputs", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.MAX_FILE_SIZE,
        enabled: true,
        severity: "error",
        params: { max_file_size: { maxBytes: 8000000 } },
      }

      const inputs = [
        createMockInput({ fileSize: 5000000, orderIndex: 0 }),
        createMockInput({ fileSize: 7000000, orderIndex: 1 }),
        createMockInput({ fileSize: 10000000, orderIndex: 2 }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(3)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
      expect(results[1]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
      expect(results[2]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
    })
  })

  describe("executeRule - ALLOWED_FILE_TYPES", () => {
    test("should pass for allowed file types", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.ALLOWED_FILE_TYPES,
        enabled: true,
        severity: "error",
        params: {
          allowed_file_types: { allowedFileTypes: ["jpg", "jpeg", "png"] },
        },
      }

      const inputs = [
        createMockInput({ fileName: "photo.jpg", mimeType: "image/jpeg" }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
    })

    test("should fail for disallowed file types", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.ALLOWED_FILE_TYPES,
        enabled: true,
        severity: "error",
        params: { allowed_file_types: { allowedFileTypes: ["jpg", "jpeg"] } },
      }

      const inputs = [
        createMockInput({ fileName: "photo.png", mimeType: "image/png" }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[0]?.message).toContain("Invalid file extension")
    })

    test("should skip when file extension cannot be determined", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.ALLOWED_FILE_TYPES,
        enabled: true,
        severity: "error",
        params: { allowed_file_types: { allowedFileTypes: ["jpg", "jpeg"] } },
      }

      const inputs = [
        createMockInput({ fileName: "photo", mimeType: "image/jpeg" }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.SKIPPED)
    })
  })

  describe("executeRule - WITHIN_TIMERANGE", () => {
    test("should pass when photo is within timerange", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.WITHIN_TIMERANGE,
        enabled: true,
        severity: "error",
        params: {
          within_timerange: {
            start: "2023-06-15T12:00:00Z",
            end: "2023-06-15T16:00:00Z",
          },
        },
      }

      const inputs = [
        createMockInput({
          exif: {
            DateTimeOriginal: "2023-06-15T14:30:00Z",
          },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
    })

    test("should fail when photo is outside timerange", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.WITHIN_TIMERANGE,
        enabled: true,
        severity: "error",
        params: {
          within_timerange: {
            start: "2023-06-15T12:00:00Z",
            end: "2023-06-15T16:00:00Z",
          },
        },
      }

      const inputs = [
        createMockInput({
          exif: {
            DateTimeOriginal: "2023-06-15T18:00:00Z",
          },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[0]?.message).toContain(
        "outside of the specified timeframe"
      )
    })

    test("should skip when timestamp cannot be determined", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.WITHIN_TIMERANGE,
        enabled: true,
        severity: "error",
        params: {
          within_timerange: {
            start: "2023-06-15T12:00:00Z",
            end: "2023-06-15T16:00:00Z",
          },
        },
      }

      const inputs = [
        createMockInput({
          exif: {},
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.SKIPPED)
    })
  })

  describe("executeRule - STRICT_TIMESTAMP_ORDERING", () => {
    test("should pass when images are in correct chronological order", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
        enabled: true,
        severity: "error",
        params: { strict_timestamp_ordering: {} },
      }

      const inputs = [
        createMockInput({
          orderIndex: 0,
          exif: { DateTimeOriginal: "2023-06-15T14:00:00Z" },
        }),
        createMockInput({
          orderIndex: 1,
          exif: { DateTimeOriginal: "2023-06-15T15:00:00Z" },
        }),
        createMockInput({
          orderIndex: 2,
          exif: { DateTimeOriginal: "2023-06-15T16:00:00Z" },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
      expect(results[0]?.isGeneral).toBe(true)
    })

    test("should fail when images are out of chronological order", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
        enabled: true,
        severity: "error",
        params: { strict_timestamp_ordering: {} },
      }

      const inputs = [
        createMockInput({
          orderIndex: 0,
          exif: { DateTimeOriginal: "2023-06-15T16:00:00Z" },
        }),
        createMockInput({
          orderIndex: 1,
          exif: { DateTimeOriginal: "2023-06-15T14:00:00Z" },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[0]?.message).toContain(
        "does not match chronological timestamp order"
      )
    })

    test("should skip when not enough images", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.STRICT_TIMESTAMP_ORDERING,
        enabled: true,
        severity: "error",
        params: { strict_timestamp_ordering: {} },
      }

      const inputs = [createMockInput()]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.SKIPPED)
    })
  })

  describe("executeRule - SAME_DEVICE", () => {
    test("should pass when all images are from same device", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.SAME_DEVICE,
        enabled: true,
        severity: "warning",
        params: { same_device: {} },
      }

      const inputs = [
        createMockInput({
          exif: { Make: "Sony", Model: "ILCE-7M3" },
        }),
        createMockInput({
          exif: { Make: "Sony", Model: "ILCE-7M3" },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
    })

    test("should fail when images are from different devices", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.SAME_DEVICE,
        enabled: true,
        severity: "warning",
        params: { same_device: {} },
      }

      const inputs = [
        createMockInput({
          exif: { Make: "Sony", Model: "ILCE-7M3" },
        }),
        createMockInput({
          exif: { Make: "Canon", Model: "EOS R5" },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[0]?.message).toContain("Different devices detected")
    })

    test("should skip when not enough images", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.SAME_DEVICE,
        enabled: true,
        severity: "warning",
        params: { same_device: {} },
      }

      const inputs = [createMockInput()]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.SKIPPED)
    })
  })

  describe("executeRule - MODIFIED", () => {
    test("should pass when photo is unmodified", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.MODIFIED,
        enabled: true,
        severity: "warning",
        params: { modified: {} },
      }

      const inputs = [createMockInput()]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
    })

    test("should fail when editing software is detected", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.MODIFIED,
        enabled: true,
        severity: "warning",
        params: { modified: {} },
      }

      const inputs = [
        createMockInput({
          exif: { Software: "Adobe Photoshop 2024" },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[0]?.message).toContain("editing software")
    })

    test("should fail when timestamps show modification", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.MODIFIED,
        enabled: true,
        severity: "warning",
        params: { modified: {} },
      }

      const inputs = [
        createMockInput({
          exif: {
            DateTimeOriginal: "2023-06-15T14:00:00Z",
            CreateDate: "2023-06-15T14:00:00Z",
            ModifyDate: "2023-06-15T16:00:00Z",
          },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[0]?.message).toContain("timestamp inconsistencies")
    })

    test("should fail when EXIF data is limited", async () => {
      const rule: ValidationRule = {
        ruleKey: RULE_KEYS.MODIFIED,
        enabled: true,
        severity: "warning",
        params: { modified: {} },
      }

      const inputs = [
        createMockInput({
          exif: {
            Make: "Sony",
            Model: "ILCE-7M3",
          },
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations([rule], inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(1)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[0]?.message).toContain("Limited EXIF data")
    })
  })

  describe("runValidations - multiple rules", () => {
    test("should execute multiple rules and return all results", async () => {
      const rules: ValidationRule[] = [
        {
          ruleKey: RULE_KEYS.MAX_FILE_SIZE,
          enabled: true,
          severity: "error",
          params: { max_file_size: { maxBytes: 10000000 } },
        },
        {
          ruleKey: RULE_KEYS.ALLOWED_FILE_TYPES,
          enabled: true,
          severity: "error",
          params: { allowed_file_types: { allowedFileTypes: ["jpg", "jpeg"] } },
        },
      ]

      const inputs = [
        createMockInput({
          fileName: "photo.jpg",
          fileSize: 5000000,
          mimeType: "image/jpeg",
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations(rules, inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(2)
      expect(results[0]?.ruleKey).toBe(RULE_KEYS.MAX_FILE_SIZE)
      expect(results[1]?.ruleKey).toBe(RULE_KEYS.ALLOWED_FILE_TYPES)
    })

    test("should handle mix of passing and failing validations", async () => {
      const rules: ValidationRule[] = [
        {
          ruleKey: RULE_KEYS.MAX_FILE_SIZE,
          enabled: true,
          severity: "error",
          params: { max_file_size: { maxBytes: 4000000 } },
        },
        {
          ruleKey: RULE_KEYS.ALLOWED_FILE_TYPES,
          enabled: true,
          severity: "error",
          params: { allowed_file_types: { allowedFileTypes: ["jpg", "jpeg"] } },
        },
      ]

      const inputs = [
        createMockInput({
          fileName: "photo.jpg",
          fileSize: 5000000,
          mimeType: "image/jpeg",
        }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations(rules, inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(2)
      expect(results[0]?.outcome).toBe(VALIDATION_OUTCOME.FAILED)
      expect(results[1]?.outcome).toBe(VALIDATION_OUTCOME.PASSED)
    })

    test("should flatten results from single and grouped validations", async () => {
      const rules: ValidationRule[] = [
        {
          ruleKey: RULE_KEYS.MAX_FILE_SIZE,
          enabled: true,
          severity: "error",
          params: { max_file_size: { maxBytes: 10000000 } },
        },
        {
          ruleKey: RULE_KEYS.SAME_DEVICE,
          enabled: true,
          severity: "warning",
          params: { same_device: {} },
        },
      ]

      const inputs = [
        createMockInput({ orderIndex: 0 }),
        createMockInput({ orderIndex: 1 }),
      ]

      const program = Effect.gen(function* () {
        const engine = yield* ValidationEngine
        return yield* engine.runValidations(rules, inputs)
      })

      const results = await runProgram(program)

      expect(results).toHaveLength(3)
      expect(
        results.filter((r) => r.ruleKey === RULE_KEYS.MAX_FILE_SIZE)
      ).toHaveLength(2)
      expect(
        results.filter((r) => r.ruleKey === RULE_KEYS.SAME_DEVICE)
      ).toHaveLength(1)
    })
  })
})
