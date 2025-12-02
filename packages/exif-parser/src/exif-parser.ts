import exifr from "exifr"
import { Data, Effect, Either, Schema } from "effect"
import { ExifSchema } from "./schemas"
import { removeGpsData, sanitizeExifData } from "./utils"

export class ExifParseError extends Data.TaggedError("ExifParserError")<{
  message?: string
  cause?: unknown
}> {}

export class ExifParser extends Effect.Service<ExifParser>()(
  "@blikka/exif-parser/exif-parser",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      const parse = Effect.fn("ExifParser.parse")(
        function* (
          file: Buffer,
          options: { keepBinaryData: boolean } = { keepBinaryData: false }
        ) {
          const exif = yield* Effect.tryPromise(() => exifr.parse(file))
          const sanitizedExif = yield* Effect.try(() =>
            sanitizeExifData(exif, options?.keepBinaryData)
          )
          const decoded = yield* Schema.decodeUnknown(ExifSchema)(sanitizedExif)
          return decoded
        },
        Effect.mapError(
          (error) =>
            new ExifParseError({
              cause: error,
              message: "Failed to parse EXIF data",
            })
        )
      )
      const parseExcludeLocationData = Effect.fn(
        "ExifParser.parseExcludeLocationData"
      )(function* (file: Buffer) {
        const exif = yield* parse(file)
        const withoutLocationData = yield* removeGpsData(exif)
        return withoutLocationData
      })

      return {
        parse,
        parseExcludeLocationData,
      } as const
    }),
  }
) {}
