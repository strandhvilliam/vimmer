export enum Parameter {
  SOFTWARE = "Software",
  TIMESTAMPS = "Timestamps",
}

export interface ExifData {
  [key: string]: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  parameter: Parameter;
  message: string;
}
