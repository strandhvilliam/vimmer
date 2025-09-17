import { Data, Effect, Layer, Option, Schema } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { SheetCreator } from "./sheet-creator"
import { FinalizedEventSchema } from "@blikka/bus"
import { Database } from "@blikka/db"
import { UploadKVRepository } from "@blikka/kv-store"
import { S3Service } from "@blikka/s3"
import { Resource as SSTResource } from "sst"
import { generateContactSheetKey, parseJson } from "./utils"

class InvalidSheetGenerationData extends Data.TaggedError("InvalidDataError")<{
  message?: string
}> {}

const VALID_PHOTO_COUNTS = [8, 24]

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const sheetCreator = yield* SheetCreator
    const db = yield* Database
    const kvStore = yield* UploadKVRepository
    const s3 = yield* S3Service

    yield* Effect.forEach(
      event.Records,
      (record) =>
        Effect.gen(function* () {
          const json = yield* parseJson(record.body)
          const params = yield* Schema.decodeUnknown(FinalizedEventSchema)(json)
          const kvData = yield* kvStore.getParticipantState(
            params.domain,
            params.reference
          )

          if (Option.isNone(kvData)) {
            return yield* Effect.fail(
              new InvalidSheetGenerationData({
                message: `Participant state not found for reference ${params.reference} and domain ${params.domain}`,
              })
            )
          }

          if (!kvData.value.finalized) {
            yield* Effect.log(
              `Participant state not finalized for reference ${params.reference} and domain ${params.domain}`
            )
            return yield* Effect.succeed(null)
          }

          if (kvData.value.contactSheetKey) {
            yield* Effect.log(
              `Contact sheet already generated for reference ${params.reference} and domain ${params.domain}`
            )
            return yield* Effect.succeed(null)
          }

          const participant =
            yield* db.participantsQueries.getParticipantByReference({
              reference: params.reference,
              domain: params.domain,
            })

          if (Option.isNone(participant)) {
            return yield* Effect.fail(
              new InvalidSheetGenerationData({
                message: `Participant not found for reference ${params.reference} and domain ${params.domain}`,
              })
            )
          }

          const sponsors = yield* db.sponsorsQueries.getSponsorsByMarathonId({
            marathonId: participant.value.marathonId,
          })

          const sponsorKey = Option.fromNullable(
            sponsors
              .filter((s) => s.type === "contact-sheets")
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              .at(-1)?.key
          )

          const topics = yield* db.topicsQueries
            .getTopicsByDomain({
              domain: params.domain,
            })
            .pipe(
              Effect.map((topics) =>
                topics.flatMap((t) => ({
                  name: t.name,
                  orderIndex: t.orderIndex,
                }))
              )
            )

          const keys = participant.value.submissions.map((s) => s.key)

          const isValidPhotoCount =
            participant.value.competitionClass?.numberOfPhotos &&
            VALID_PHOTO_COUNTS.includes(
              participant.value.competitionClass.numberOfPhotos
            ) &&
            keys.length === participant.value.competitionClass.numberOfPhotos

          if (!isValidPhotoCount) {
            return yield* Effect.fail(
              new InvalidSheetGenerationData({
                message: `Invalid photo count for participant ${params.reference} and domain ${params.domain}`,
              })
            )
          }

          const contactSheetBuffer = yield* sheetCreator.createSheet({
            domain: params.domain,
            reference: params.reference,
            keys,
            sponsorKey: Option.isSome(sponsorKey)
              ? sponsorKey.value
              : undefined,
            sponsorPosition: "bottom-right",
            topics,
          })

          const contactSheetKey = generateContactSheetKey(
            params.domain,
            params.reference
          )
          yield* s3.putFile(
            SSTResource.V2ContactSheetsBucket.name,
            contactSheetKey,
            contactSheetBuffer
          )

          yield* db.participantsQueries.updateParticipantByReference({
            reference: params.reference,
            domain: params.domain,
            data: {
              contactSheetKey,
            },
          })
          yield* kvStore.updateParticipantState(
            params.domain,
            params.reference,
            {
              contactSheetKey,
            }
          )
        }),
      {
        concurrency: 3,
      }
    )
  }).pipe(
    Effect.withSpan("uploadProcessor.handler"),
    Effect.tapError((error) =>
      Effect.logError("Handler failed with error", error)
    )
  )

const MainLayer = Layer.mergeAll(
  SheetCreator.Default,
  S3Service.Default,
  Database.Default,
  UploadKVRepository.Default
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: MainLayer,
})
