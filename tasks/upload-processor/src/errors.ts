import { Data } from "effect";

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  message?: string;
}> {}
export class InvalidKeyFormatError extends Data.TaggedError(
  "InvalidKeyFormatError",
)<{
  message?: string;
}> {}

export class PhotoNotFoundError extends Data.TaggedError("PhotoNotFoundError")<{
  message?: string;
  cause?: unknown;
  details?: string;
}> {}

export class InvalidS3EventError extends Data.TaggedError(
  "InvalidS3EventError",
)<{
  message?: string;
  cause?: unknown;
}> {}

export class FailedToIncrementParticipantStateError extends Data.TaggedError(
  "FailedToIncrementParticipantStateError",
)<{
  message?: string;
  cause?: unknown;
}> {}

export class FailedToFinalizeParticipantError extends Data.TaggedError(
  "FailedToFinalizeParticipantError",
)<{
  message?: string;
  cause?: unknown;
  domain: string;
  reference: string;
}> {}
