import { Participant } from "@blikka/db"
import { Data } from "effect"

export class InvalidArgumentsError extends Data.TaggedError(
  "InvalidArgumentsError"
)<{
  cause?: unknown
}> {}

export class DataNotFoundError extends Data.TaggedError("DataNotFoundError")<{
  domain: string
  reference: string
  key?: string
  message?: string
  cause?: unknown
}> {}

export class FailedToGenerateZipError extends Data.TaggedError(
  "FailedToGenerateZipError"
)<{
  domain: string
  reference: string
  message?: string
  cause?: unknown
}> {}

export function makeNewZipDto(domain: string, participant: Participant) {
  return {
    data: {
      marathonId: participant.marathonId,
      participantId: participant.id,
      zipKey: `${domain}/${participant.reference}.zip`,
      exportType: "zip",
      progress: 100,
      status: "completed",
      errors: [],
    },
  }
}
