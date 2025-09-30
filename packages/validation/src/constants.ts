export const RULE_KEYS = {
  MAX_FILE_SIZE: "max_file_size",
  ALLOWED_FILE_TYPES: "allowed_file_types",
  STRICT_TIMESTAMP_ORDERING: "strict_timestamp_ordering",
  SAME_DEVICE: "same_device",
  WITHIN_TIMERANGE: "within_timerange",
  MODIFIED: "modified",
} as const;

export const IMAGE_EXTENSION_TO_MIME_TYPE = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
} as const;

export const VALIDATION_OUTCOME = {
  PASSED: "passed",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;

export const EDITING_SOFTWARE_KEYWORDS = [
  "photoshop",
  "lightroom",
  "gimp",
  "affinity",
  "capture one",
  "luminar",
  "pixlr",
  "snapseed",
  "acdsee",
  "paintshop",
] as const;
