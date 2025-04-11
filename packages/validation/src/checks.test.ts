import { test, expect, describe } from "bun:test";
import {
  checkAllowedFileTypes,
  checkFileSize,
  checkModified,
  checkSameDevice,
  checkStrictTimestampOrdering,
  checkTimeframe,
} from "./checks";
import { RULE_KEYS } from "./constants";
import type { ValidationInput } from "./types";

describe("File validation checks", () => {
  // Mock data for testing
  const createMockInput = (overrides = {}): ValidationInput => ({
    exif: {
      Make: "Sony",
      Model: "Alpha A7III",
      SerialNumber: "12345",
      DateTimeOriginal: "2023-06-15T14:30:00Z",
      CreateDate: "2023-06-15T14:30:00Z",
      ModifyDate: "2023-06-15T14:35:00Z",
      DateTime: "2023-06-15T14:35:00Z",
    },
    fileName: "test_image.jpg",
    fileSize: 5000000, // 5MB
    orderIndex: 0,
    mimeType: "image/jpeg",
    ...overrides,
  });

  describe("checkAllowedFileTypes", () => {
    test("should validate allowed file extensions", () => {
      const input = [createMockInput()];
      const rule = { allowedFileTypes: ["jpg", "jpeg", "png"] };

      const results = checkAllowedFileTypes(rule, input);

      expect(results.length).toBe(2); // Extension check and MIME type check
      expect(results.every((result) => result.isValid)).toBe(true);
    });

    test("should fail on disallowed file extensions", () => {
      const input = [createMockInput({ fileName: "test_image.bmp" })];
      const rule = { allowedFileTypes: ["jpg", "jpeg", "png"] };

      const results = checkAllowedFileTypes(rule, input);

      expect(results.some((result) => !result.isValid)).toBe(true);
    });

    test("should fail on disallowed mime types", () => {
      const input = [createMockInput({ mimeType: "image/bmp" })];
      const rule = { allowedFileTypes: ["jpg", "jpeg", "png"] };

      const results = checkAllowedFileTypes(rule, input);

      expect(results.some((result) => !result.isValid)).toBe(true);
    });
  });

  describe("checkFileSize", () => {
    test("should validate files under the size limit", () => {
      const input = [createMockInput({ fileSize: 5000000 })]; // 5MB
      const rule = { maxBytes: 10000000 }; // 10MB limit

      const results = checkFileSize(rule, input);

      expect(results.length).toBe(1);
      expect(results[0].isValid).toBe(true);
    });

    test("should fail for files over the size limit", () => {
      const input = [createMockInput({ fileSize: 15000000 })]; // 15MB
      const rule = { maxBytes: 10000000 }; // 10MB limit

      const results = checkFileSize(rule, input);

      expect(results.length).toBe(1);
      expect(results[0].isValid).toBe(false);
    });
  });

  describe("checkModified", () => {
    test("should validate unmodified images", () => {
      const input = [createMockInput()];
      const rule = {};

      const results = checkModified(rule, input);

      expect(results.every((result) => result.isValid)).toBe(true);
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

      expect(results.some((result) => !result.isValid)).toBe(true);
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

      expect(results.some((result) => !result.isValid)).toBe(true);
    });
  });

  describe("checkSameDevice", () => {
    test("should validate images from same device", () => {
      const input = [
        createMockInput(),
        createMockInput({ orderIndex: 1 }),
        createMockInput({ orderIndex: 2 }),
      ];
      const rule = {};

      const results = checkSameDevice(rule, input);

      expect(results.length).toBe(1);
      expect(results[0].isValid).toBe(true);
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
      expect(results[0].isValid).toBe(false);
    });
  });

  describe("checkStrictTimestampOrdering", () => {
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
      expect(results[0].isValid).toBe(true);
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
      expect(results[0].isValid).toBe(false);
    });
  });

  describe("checkTimeframe", () => {
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
});
