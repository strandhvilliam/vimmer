import { Data, Effect } from "effect"

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  message?: string
}> {}
export class InvalidKeyFormatError extends Data.TaggedError(
  "InvalidKeyFormatError"
)<{
  message?: string
}> {}

export class PhotoNotFoundError extends Data.TaggedError("PhotoNotFoundError")<{
  message?: string
  cause?: unknown
  details?: string
}> {}

export class InvalidS3EventError extends Data.TaggedError(
  "InvalidS3EventError"
)<{
  message?: string
  cause?: unknown
}> {}

export class FailedToIncrementParticipantStateError extends Data.TaggedError(
  "FailedToIncrementParticipantStateError"
)<{
  message?: string
  cause?: unknown
}> {}

export class FailedToFinalizeParticipantError extends Data.TaggedError(
  "FailedToFinalizeParticipantError"
)<{
  message?: string
  cause?: unknown
  domain: string
  reference: string
}> {}

export const parseJson = (input: string) =>
  Effect.try({
    try: () => JSON.parse(input),
    catch: (unknown) => new JsonParseError({ message: "Failed to parse JSON" }),
  })

export const parseKey = (key: string) =>
  Effect.sync(() => {
    const [domain, reference, orderIndex, fileName] = key.split("/")
    if (!domain || !reference || !orderIndex || !fileName) {
      return Effect.fail(
        new InvalidKeyFormatError({
          message: `Missing: domain=${domain}, reference=${reference}, orderIndex=${orderIndex}, fileName=${fileName}`,
        })
      )
    }
    return Effect.succeed({ domain, reference, orderIndex, fileName })
  }).pipe(Effect.flatten)

export const makeThumbnailKey = (params: {
  domain: string
  reference: string
  orderIndex: string
  fileName: string
}) =>
  `${params.domain}/${params.reference}/${params.orderIndex}/thumbnail_${params.fileName}`
