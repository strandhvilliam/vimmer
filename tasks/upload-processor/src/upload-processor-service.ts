import { Effect, Option, Either, Schedule, Duration } from "effect"
import { S3Service } from "@blikka/s3"
import {
  ExifKVRepository,
  ExifState,
  UploadKVRepository,
} from "@blikka/kv-store"
import { SharpImageService } from "@blikka/image-manipulation"
import { ExifParser } from "@blikka/exif-parser"
import { BusService } from "@blikka/bus"
import { Database } from "@blikka/db"
import {
  parseKey,
  FailedToFinalizeParticipantError,
  FailedToIncrementParticipantStateError,
  PhotoNotFoundError,
  makeThumbnailKey,
} from "./utils"
import { Resource as SSTResource } from "sst"

const THUMBNAIL_WIDTH = 400

export class UploadProcessorService extends Effect.Service<UploadProcessorService>()(
  "@blikka/tasks/UploadProcessorService",
  {
    dependencies: [
      S3Service.Default,
      UploadKVRepository.Default,
      ExifKVRepository.Default,
      SharpImageService.Default,
      ExifParser.Default,
      BusService.Default,
      Database.Default,
    ],
    effect: Effect.gen(function* () {
      const s3 = yield* S3Service
      const uploadKv = yield* UploadKVRepository
      const exifKv = yield* ExifKVRepository
      const sharp = yield* SharpImageService
      const exifParser = yield* ExifParser
      const bus = yield* BusService
      const db = yield* Database

      const generateThumbnail = Effect.fn("upload-processor.generateThumbnail")(
        function* (photo: Buffer, key: string) {
          const { domain, reference, orderIndex, fileName } =
            yield* parseKey(key)
          const thumbnailKey = makeThumbnailKey({
            domain,
            reference,
            orderIndex,
            fileName,
          })

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
        function* (domain: string, reference: string, error: string) {
          yield* uploadKv.setParticipantErrorState(domain, reference, error)
          yield* Effect.logError(error)
        },
        Effect.catchAll((error) =>
          Effect.logError("Failed to set participant error state", error)
        )
      )

      const finalizeParticipant = Effect.fn(
        "upload-processor.finalizeParticipant"
      )(
        function* (domain: string, reference: string) {
          const participantStateOpt = yield* uploadKv.getParticipantState(
            domain,
            reference
          )

          if (Option.isNone(participantStateOpt)) {
            return yield* Effect.fail(
              new FailedToFinalizeParticipantError({
                cause: "Participant state not found",
                message: "Participant state not found",
                domain,
                reference,
              })
            )
          }
          const processedIndexes = participantStateOpt.value.processedIndexes
          const processedIndexStrings = processedIndexes.map((i) => `${i}`)
          const uploadCount = processedIndexes.filter((v) => v !== 0).length

          const submissionStatesOpt = yield* uploadKv.getAllSubmissionStates(
            domain,
            reference,
            processedIndexStrings
          )
          const exifStates = yield* exifKv.getAllExifStates(
            domain,
            reference,
            processedIndexStrings
          )

          if (Option.isNone(submissionStatesOpt)) {
            return yield* Effect.fail(
              new FailedToFinalizeParticipantError({
                cause: "Submission states or exif states not found",
                message: "Submission states or exif states not found",
                domain,
                reference,
              })
            )
          }

          const submissionStates = submissionStatesOpt.value

          const updates = submissionStates.map((state) => {
            const exif =
              exifStates.find(
                (e) => e.orderIndex === state.orderIndex.toString()
              )?.exif ?? {}

            return {
              orderIndex: state.orderIndex,
              data: {
                status: "uploaded" as const,
                thumbnailKey: state.thumbnailKey,
                exif: state.exifProcessed ? exif : {},
                uploaded: state.uploaded,
              },
            }
          })

          yield* db.submissionsQueries
            .updateAllSubmissions({
              reference,
              domain,
              updates,
            })
            .pipe(
              Effect.mapError(
                () =>
                  new FailedToFinalizeParticipantError({
                    cause: "Failed to update submissions",
                    message: "Failed to update submissions",
                    domain,
                    reference,
                  })
              )
            )

          yield* db.participantsQueries
            .updateParticipantByReference({
              reference,
              domain,
              data: {
                uploadCount,
                status: "completed",
              },
            })
            .pipe(
              Effect.mapError(
                () =>
                  new FailedToFinalizeParticipantError({
                    cause: "Failed to update participant",
                    message: "Failed to update participant",
                    domain,
                    reference,
                  })
              )
            )

          yield* bus.sendFinalizedEvent(domain, reference).pipe(
            Effect.mapError(
              () =>
                new FailedToFinalizeParticipantError({
                  cause: "Failed to send finalized event",
                  message: "Failed to send finalized event",
                  domain,
                  reference,
                })
            )
          )
        },
        Effect.retryOrElse(
          Schedule.compose(
            Schedule.exponential(Duration.millis(400)),
            Schedule.recurs(3)
          ),
          (err) =>
            Effect.gen(function* () {
              yield* setParticipantErrorState(
                err.domain,
                err.reference,
                err.message ?? "Failed to finalize participant"
              )
              yield* Effect.logError("Failed to finalize participant", err)
            })
        )
      )

      const processPhoto = Effect.fn("upload-processor.processPhoto")(
        function* (key: string) {
          const { domain, reference, orderIndex } = yield* parseKey(key)

          const submissionStateOpt = yield* uploadKv.getSubmissionState(
            domain,
            reference,
            orderIndex
          )
          if (
            Option.isSome(submissionStateOpt) &&
            submissionStateOpt.value.uploaded
          ) {
            yield* Effect.logWarning("Submission already uploaded, skipping")
            return
          }

          const photo = yield* s3
            .getFile(SSTResource.V2SubmissionsBucket.name, key)
            .pipe(
              Effect.mapError(
                (cause) =>
                  new PhotoNotFoundError({
                    cause,
                    message: "Photo not found",
                  })
              )
            )

          if (Option.isNone(photo)) {
            return yield* Effect.fail(
              new PhotoNotFoundError({
                cause: "Photo not found",
                message: "Photo not found",
              })
            )
          }

          const [exifResult, thumbnailKeyResult] = yield* Effect.all(
            [
              Effect.either(exifParser.parse(Buffer.from(photo.value))),
              Effect.either(generateThumbnail(Buffer.from(photo.value), key)),
            ],
            { concurrency: 2 }
          )

          const exifOpt = yield* Either.match(exifResult, {
            onLeft: () =>
              setParticipantErrorState(domain, reference, "EXIF_ERROR").pipe(
                Effect.as(Option.none<ExifState>())
              ),
            onRight: (result) =>
              exifKv.setExifState(domain, reference, orderIndex, result).pipe(
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
              setParticipantErrorState(
                domain,
                reference,
                "THUMBNAIL_ERROR"
              ).pipe(Effect.as(Option.none<string>())),
            onRight: (key) => Effect.succeed(Option.some(key)),
          })

          yield* uploadKv
            .updateSubmissionState(domain, reference, orderIndex, {
              uploaded: true,
              orderIndex: Number(orderIndex),
              thumbnailKey: Option.isSome(thumbnailOpt)
                ? thumbnailOpt.value
                : null,
              exifProcessed: Option.isSome(exifOpt),
            })
            .pipe(
              Effect.orElse(() =>
                Effect.logError("Failed to update submission state")
              )
            )

          const { finalize } = yield* uploadKv
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
            yield* finalizeParticipant(domain, reference)
          }
        }
      )

      return {
        processPhoto,
      }
    }),
  }
) {}
