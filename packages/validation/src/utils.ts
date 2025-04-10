import type { Parameter } from "./types";
import type { ValidationResult } from "./types";

export const createValidationResult = (
  isValid: boolean,
  parameter: Parameter,
  message: string
): ValidationResult => ({
  isValid,
  parameter,
  message,
});
