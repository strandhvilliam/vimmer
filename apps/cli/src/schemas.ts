import { Schema } from "effect"

export const ParticipantReferenceInputSchema = Schema.String.pipe(
  Schema.length(4)
)
export const ParticipantNameInputSchema = Schema.String.pipe(
  Schema.minLength(2)
)

export const ParticipantEmailInputSchema = Schema.NonEmptyString.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
)
