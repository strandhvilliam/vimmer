import { Data, Effect } from "effect"

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  message?: string
}> {}
export class InvalidKeyFormatError extends Data.TaggedError(
  "InvalidKeyFormatError"
)<{
  message?: string
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
