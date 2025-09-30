import { Schema } from "effect";

export const SubmissionStateSchema = Schema.Struct({
  key: Schema.String,
  orderIndex: Schema.Number,
  uploaded: Schema.Boolean,
  thumbnailKey: Schema.NullOr(Schema.String),
  exifProcessed: Schema.Boolean,
});

export const makeInitialSubmissionState = (key: string, orderIndex: number) =>
  SubmissionStateSchema.make({
    key,
    uploaded: false,
    orderIndex,
    thumbnailKey: null,
    exifProcessed: false,
  });

export const ParticipantStateSchema = Schema.Struct({
  expectedCount: Schema.Number,
  processedIndexes: Schema.Array(Schema.Number),
  validated: Schema.Boolean,
  zipKey: Schema.String,
  contactSheetKey: Schema.String,
  errors: Schema.Array(Schema.String),
  finalized: Schema.Boolean,
});

export const makeInitialParticipantState = (expectedCount: number) =>
  ParticipantStateSchema.make({
    expectedCount,
    processedIndexes: Array.from({ length: expectedCount }, () => 0),
    validated: false,
    zipKey: "",
    contactSheetKey: "",
    errors: [],
    finalized: false,
  });

export const ExifStateSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

export const IncrementResultSchema = Schema.Literal(
  "FINALIZED",
  "PROCESSED_SUBMISSION",
  "DUPLICATE_ORDER_INDEX",
  "ALREADY_FINALIZED",
  "INVALID_ORDER_INDEX",
  "MISSING_DATA",
);

export const ZipProgressSchema = Schema.Struct({
  progress: Schema.Number,
  status: Schema.String,
  errors: Schema.Array(Schema.String),
  zipKey: Schema.String,
});

export const makeInitialZipProgress = (zipKey: string) =>
  ZipProgressSchema.make({
    progress: 0,
    status: "pending",
    errors: [],
    zipKey,
  });

export type SubmissionState = typeof SubmissionStateSchema.Type;
export type ParticipantState = typeof ParticipantStateSchema.Type;
export type ExifState = typeof ExifStateSchema.Type;
