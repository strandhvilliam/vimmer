import { Data, Effect, Layer, Option, Schema } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { SheetCreator } from "./sheet-creator"
import { FinalizedEventSchema } from "@blikka/bus"
import { Database } from "@blikka/db"

class InvalidSheetGenerationData extends Data.TaggedError("InvalidDataError")<{
  message?: string
}> {}

const VALID_PHOTO_COUNTS = [8, 24]

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const sheetCreator = yield* SheetCreator
    const db = yield* Database

    yield* Effect.forEach(
      event.Records,
      (record) =>
        Effect.gen(function* () {
          const params = yield* Schema.decodeUnknown(FinalizedEventSchema)(
            record.body
          )

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

          const sponsorKey = sponsors
            .filter((s) => s.type === "contact-sheets")
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .at(-1)?.key

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

const MainLayer = Layer.mergeAll(SheetCreator.Default)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: MainLayer,
})
