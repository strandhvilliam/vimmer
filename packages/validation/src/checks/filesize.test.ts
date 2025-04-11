import { test, expect, describe } from "bun:test";
import { validate as checkFileSize } from "./filesize";
import { createMockInput } from "../utils";

describe("filesize check", () => {
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
