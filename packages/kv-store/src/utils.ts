import { Data, Effect } from "effect"

export class InvalidKeyFormatError extends Data.TaggedError(
  "InvalidKeyFormatError"
)<{
  message?: string
}> {}

export const parseKey = Effect.fn("utils.parseKey")(function* (key: string) {
  const [domain, reference, formattedOrderIndex, fileName] = key.split("/")
  if (!domain || !reference || !formattedOrderIndex || !fileName) {
    return yield* new InvalidKeyFormatError({
      message: `Missing: domain=${domain}, reference=${reference}, orderIndex=${formattedOrderIndex}, fileName=${fileName}`,
    })
  }
  const orderIndex = Number(formattedOrderIndex) - 1
  return {
    domain,
    reference,
    orderIndex,
    fileName,
  }
})
