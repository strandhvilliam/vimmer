import { Schema } from "effect"

export const SponsorPositionSchema = Schema.Literal(
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
  "center"
)

export type SponsorPosition = typeof SponsorPositionSchema.Type
