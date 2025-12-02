export type ErrorSeverity = "error" | "warning";

export enum ErrorCode {
  INVALID_KEY_FORMAT = "SUB_E001",
  FAILED_TO_FETCH_PHOTO = "SUB_E002",
  NO_EXIF_DATA = "SUB_E003",
  SUBMISSION_MUTATION_FAILED = "SUB_E004",
  IMAGE_VARIANT_CREATION_FAILED = "SUB_E005",
  UNKNOWN_ERROR = "SUB_E010",
}

const SubmissionErrorCatalog = {
  [ErrorCode.INVALID_KEY_FORMAT]: {
    code: ErrorCode.INVALID_KEY_FORMAT,
    message: "Invalid submission key format",
    severity: "error",
    description: "The submission key does not match the expected format",
  },
  [ErrorCode.FAILED_TO_FETCH_PHOTO]: {
    code: ErrorCode.FAILED_TO_FETCH_PHOTO,
    message: "Failed to fetch photo",
    severity: "error",
    description: "The photo could not be retrieved from the submission bucket",
  },
  [ErrorCode.NO_EXIF_DATA]: {
    code: ErrorCode.NO_EXIF_DATA,
    message: "No exif data",
    severity: "error",
    description: "The submission metadata could not be found",
  },
  [ErrorCode.SUBMISSION_MUTATION_FAILED]: {
    code: ErrorCode.SUBMISSION_MUTATION_FAILED,
    message: "Submission mutation failed",
    severity: "error",
    description: "The submission could not be saved to the database",
  },
  [ErrorCode.IMAGE_VARIANT_CREATION_FAILED]: {
    code: ErrorCode.IMAGE_VARIANT_CREATION_FAILED,
    message: "Image variant creation failed",
    severity: "error",
    description: "The image variants could not be created",
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    code: ErrorCode.UNKNOWN_ERROR,
    message: "Unknown error",
    severity: "error",
    description: "An unknown error occurred",
  },
} as const;

export class SubmissionProcessingError extends Error {
  constructor(
    public readonly codes: ErrorCode[],
    public readonly context?: object,
    public readonly catalog?: (typeof SubmissionErrorCatalog)[ErrorCode][],
  ) {
    super();
    this.catalog = codes.map((code) => SubmissionErrorCatalog[code]);
    this.name = "SubmissionProcessingError";
    console.error("SubmissionProcessingError:", this);
  }
}
