import { Data, Effect, Either, Layer, Option, Schema } from "effect"
import { S3Service } from "@blikka/s3"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { parseJson, parseKey } from "./utils"
import { ExifState, UploadKVRepository } from "@blikka/kv-store"
import { ExifParser } from "@blikka/exif-parser"
import { SharpImageService } from "@blikka/image-manipulation"
import { Resource as SSTResource } from "sst"
import { SQSRecord } from "aws-lambda"
import { BusService } from "@blikka/bus"

class PhotoNotFoundError extends Data.TaggedError("PhotoNotFoundError")<{
  message?: string
  cause?: unknown
}> {}

class InvalidS3EventError extends Data.TaggedError("InvalidS3EventError")<{
  message?: string
  cause?: unknown
}> {}

class FailedToIncrementParticipantStateError extends Data.TaggedError(
  "FailedToIncrementParticipantStateError"
)<{
  message?: string
  cause?: unknown
}> {}

interface ProcessingContext {
  s3: S3Service
  kv: UploadKVRepository
  sharp: SharpImageService
  exifParser: ExifParser
  bus: BusService
}

const S3EventSchema = Schema.Struct({
  Records: Schema.Array(
    Schema.Struct({
      s3: Schema.Struct({
        object: Schema.Struct({
          key: Schema.String,
        }),
        bucket: Schema.Struct({
          name: Schema.String,
        }),
      }),
    })
  ),
})

const THUMBNAIL_WIDTH = 400

const processPhoto = (ctx: ProcessingContext, key: string) =>
  Effect.gen(function* () {
    const { s3, kv, sharp, exifParser, bus } = ctx

    const generateThumbnail = Effect.fn("upload-processor.generateThumbnail")(
      function* (photo: Buffer, key: string) {
        const { domain, reference, orderIndex, fileName } = yield* parseKey(key)
        const thumbnailKey = `${domain}/${reference}/${orderIndex}/thumbnail_${fileName}`

        const resized = yield* sharp.resize(Buffer.from(photo), {
          width: THUMBNAIL_WIDTH,
        })
        yield* s3.putFile(
          SSTResource.V2ThumbnailsBucket.name,
          thumbnailKey,
          resized
        )
        return thumbnailKey
      }
    )

    const setParticipantErrorState = Effect.fnUntraced(
      function* (error: string) {
        yield* kv.setParticipantErrorState(domain, reference, error)
        yield* Effect.logError(error)
      },
      Effect.catchAll((error) =>
        Effect.logError("Failed to set participant error state", error)
      )
    )

    const { domain, reference, orderIndex, fileName } = yield* parseKey(key)

    const submissionState = yield* kv.getSubmissionState(
      domain,
      reference,
      orderIndex
    )
    if (Option.isSome(submissionState) && submissionState.value.uploaded) {
      yield* Effect.logWarning("Submission already uploaded, skipping")
      return
    }

    const photo = yield* Effect.either(
      s3.getFile(SSTResource.V2SubmissionsBucket.name, key)
    )

    if (Either.isLeft(photo)) {
      return yield* Effect.fail(
        new PhotoNotFoundError({
          cause: photo.left,
          message: "Photo not found",
        })
      )
    }

    const [exifResult, thumbnailKeyResult] = yield* Effect.all(
      [
        Effect.either(exifParser.parse(Buffer.from(photo.right))),
        Effect.either(generateThumbnail(Buffer.from(photo.right), key)),
      ],
      { concurrency: 2 }
    )

    const exifOpt = yield* Either.match(exifResult, {
      onLeft: () =>
        setParticipantErrorState("EXIF_ERROR").pipe(
          Effect.as(Option.none<ExifState>())
        ),
      onRight: (result) =>
        kv.setExifState(domain, reference, orderIndex, result).pipe(
          Effect.map(() => Option.some(result)),
          Effect.catchAll((error) =>
            Effect.zipRight(
              Effect.logError("Failed to set exif state", error),
              Effect.succeed(Option.none<ExifState>())
            )
          )
        ),
    })

    const thumbnailOpt = yield* Either.match(thumbnailKeyResult, {
      onLeft: () =>
        setParticipantErrorState("THUMBNAIL_ERROR").pipe(
          Effect.as(Option.none<string>())
        ),
      onRight: (key) => Effect.succeed(Option.some(key)),
    })

    yield* kv
      .updateSubmissionState(domain, reference, orderIndex, {
        uploaded: true,
        orderIndex: Number(orderIndex),
        thumbnailKey: Option.isSome(thumbnailOpt) ? thumbnailOpt.value : null,
        exifProcessed: Option.isSome(exifOpt),
      })
      .pipe(
        Effect.orElse(() =>
          Effect.logError("Failed to update submission state")
        )
      )

    const { finalize } = yield* kv
      .incrementParticipantState(domain, reference, orderIndex)
      .pipe(
        Effect.orElse(() =>
          Effect.fail(
            new FailedToIncrementParticipantStateError({
              cause: "Failed to increment participant state",
              message: "Failed to increment participant state",
            })
          )
        )
      )

    if (finalize) {
      const result = yield* Effect.either(
        bus.sendFinalizedEvent(domain, reference)
      )
      if (Either.isLeft(result)) {
        yield* setParticipantErrorState("FAILED_TO_SEND_FINALIZED_EVENT")
      }
    }
  })

const processSQSRecord = (ctx: ProcessingContext, record: SQSRecord) =>
  Effect.gen(function* () {
    const s3Event = yield* parseJson(record.body).pipe(
      Effect.flatMap(Schema.decodeUnknown(S3EventSchema)),
      Effect.mapError(
        (cause) =>
          new InvalidS3EventError({
            cause,
            message: "Failed to parse S3 event",
          })
      )
    )

    yield* Effect.forEach(
      s3Event.Records,
      (record) =>
        Effect.gen(function* () {
          const key = record.s3.object.key
          return yield* processPhoto(ctx, key)
        }),
      { concurrency: 2 }
    ).pipe(
      Effect.catchTag("PhotoNotFoundError", (error) =>
        Effect.logError("Photo not found", error)
      ),
      Effect.catchTag("FailedToIncrementParticipantStateError", (error) =>
        Effect.logError("Failed to increment participant state", error)
      ),
      Effect.catchTag("InvalidKeyFormatError", (error) =>
        Effect.logError("Invalid S3 event", error)
      )
    )
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError("Failed to process SQS record", error)
      })
    )
  )

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const ctx: ProcessingContext = {
      s3: yield* S3Service,
      kv: yield* UploadKVRepository,
      sharp: yield* SharpImageService,
      exifParser: yield* ExifParser,
      bus: yield* BusService,
    }

    yield* Effect.forEach(
      event.Records,
      (record) => processSQSRecord(ctx, record),
      { concurrency: 3 }
    )
  }).pipe(
    Effect.withSpan("uploadProcessor.handler"),
    Effect.tapError((error) =>
      Effect.logError("Handler failed with error", error)
    )
  )

const MainLayer = Layer.mergeAll(
  S3Service.Default,
  UploadKVRepository.Default,
  SharpImageService.Default,
  ExifParser.Default,
  BusService.Default
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: MainLayer,
})
