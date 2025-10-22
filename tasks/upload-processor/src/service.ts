import { Effect, Option, Schedule, Duration } from "effect"
import { S3Service } from "@blikka/s3"
import { ExifKVRepository, ExifState, UploadKVRepository } from "@blikka/kv-store"
import { ThumbnailService } from "./thumbnail-service"
import { ExifParser } from "@blikka/exif-parser"
import { BusService } from "@blikka/bus"
import { Database } from "@blikka/db"
import { parseKey } from "./utils"
import { Resource as SSTResource } from "sst"
import {
  FailedToFinalizeParticipantError,
  FailedToIncrementParticipantStateError,
  PhotoNotFoundError,
} from "./errors"

export class UploadProcessorService extends Effect.Service<UploadProcessorService>()(
  "@blikka/tasks/UploadProcessorService",
  {
    dependencies: [
      S3Service.Default,
      UploadKVRepository.Default,
      ExifKVRepository.Default,
      ExifParser.Default,
      BusService.Default,
      Database.Default,
      ThumbnailService.Default,
    ],
    effect: Effect.gen(function* () {
      const s3 = yield* S3Service
      const uploadKv = yield* UploadKVRepository
      const exifKv = yield* ExifKVRepository
      const exifParser = yield* ExifParser
      const bus = yield* BusService
      const db = yield* Database
      const thumbnailService = yield* ThumbnailService

      const handleParticipantError = Effect.fnUntraced(
        function* (domain: string, reference: string, errorCode: string, error: Error) {
          return yield* uploadKv
            .setParticipantErrorState(domain, reference, errorCode)
            .pipe(Effect.andThen(() => Effect.logError(error.message, error.cause)))
        },
        Effect.catchAll((error) => Effect.logError("Failed to set participant error state", error))
      )

      const finalizeParticipant = Effect.fn("UploadProcessorService.finalizeParticipant")(
        function* (domain: string, reference: string) {
          const participantState = yield* uploadKv.getParticipantState(domain, reference).pipe(
            Effect.andThen(
              Option.getOrThrowWith(
                () =>
                  new FailedToFinalizeParticipantError({
                    cause: "Participant state not found",
                    message: "Participant state not found",
                    domain,
                    reference,
                  })
              )
            )
          )

          const uploadCount = participantState.processedIndexes.filter((v) => v !== 0).length
          const orderIndexes = participantState.processedIndexes.map((_, i) => i)

          const [submissionStates, exifStates] = yield* Effect.all(
            [
              uploadKv.getAllSubmissionStates(domain, reference, orderIndexes),
              exifKv.getAllExifStates(domain, reference, orderIndexes),
            ],
            { concurrency: 2 }
          )

          if (submissionStates.length === 0 || exifStates.length === 0) {
            return yield* new FailedToFinalizeParticipantError({
              cause: "Submission states or exif states not found",
              message: "Submission states or exif states not found",
              domain,
              reference,
            })
          }

          const updates = submissionStates.map((state) => {
            const exif = exifStates.find((e) => e.orderIndex === state.orderIndex)?.exif ?? {}

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

          yield* Effect.all(
            [
              db.submissionsQueries.updateAllSubmissions({
                reference,
                domain,
                updates,
              }),
              db.participantsQueries.updateParticipantByReference({
                reference,
                domain,
                data: {
                  uploadCount,
                  status: "completed",
                },
              }),
            ],
            { concurrency: 2 }
          )

          yield* bus.sendFinalizedEvent(domain, reference)
        },
        Effect.retryOrElse(
          Schedule.compose(Schedule.exponential(Duration.millis(400)), Schedule.recurs(1)),
          (err) =>
            Effect.gen(function* () {
              if (err instanceof FailedToFinalizeParticipantError) {
                yield* handleParticipantError(
                  err.domain,
                  err.reference,
                  err.message ?? "Failed to finalize participant",
                  err
                )
              }
            })
        )
      )

      const processPhoto = Effect.fn("UploadProcessorService.processPhoto")(function* (
        key: string
      ) {
        const { domain, reference, orderIndex } = yield* parseKey(key)

        const submissionStateOpt = yield* uploadKv.getSubmissionState(domain, reference, orderIndex)
        if (Option.isSome(submissionStateOpt) && submissionStateOpt.value.uploaded) {
          yield* Effect.logWarning("Submission already uploaded, skipping")
          return
        }

        const photo = yield* s3.getFile(SSTResource.V2SubmissionsBucket.name, key).pipe(
          Effect.andThen(
            Option.getOrThrowWith(
              () =>
                new PhotoNotFoundError({
                  cause: "Photo not found",
                  message: "Photo not found",
                })
            )
          )
        )

        const exifResult = yield* exifParser.parse(Buffer.from(photo)).pipe(
          Effect.tap((exif) => exifKv.setExifState(domain, reference, orderIndex, exif)),
          Effect.map(Option.some),
          Effect.catchAll((error) =>
            handleParticipantError(domain, reference, "EXIF_ERROR", error).pipe(
              Effect.as(Option.none<ExifState>())
            )
          )
        )

        const thumbnailResult = yield* thumbnailService
          .generateThumbnail(Buffer.from(photo), key)
          .pipe(
            Effect.map(Option.some),
            Effect.catchAll((error) =>
              handleParticipantError(domain, reference, "THUMBNAIL_ERROR", error).pipe(
                Effect.as(Option.none<string>())
              )
            )
          )

        yield* uploadKv
          .updateSubmissionState(domain, reference, orderIndex, {
            uploaded: true,
            orderIndex: Number(orderIndex),
            thumbnailKey: Option.getOrNull(thumbnailResult),
            exifProcessed: Option.isSome(exifResult),
          })
          .pipe(Effect.orElse(() => Effect.logError("Failed to update submission state")))

        const { finalize } = yield* uploadKv
          .incrementParticipantState(domain, reference, orderIndex)
          .pipe(
            Effect.orElseFail(
              () =>
                new FailedToIncrementParticipantStateError({
                  cause: "Failed to increment participant state",
                  message: "Failed to increment participant state",
                })
            )
          )

        if (finalize) {
          yield* finalizeParticipant(domain, reference)
        }
      })

      return {
        processPhoto,
      } as const
    }),
  }
) {}
