import { Effect, Layer, Option, Schema } from "effect"
import { type SQSEvent, LambdaHandler } from "@effect-aws/lambda"
import { SheetCreator } from "./sheet-creator"
import { Database } from "@blikka/db"
import { UploadKVRepository } from "@blikka/kv-store"
import { S3Service } from "@blikka/s3"
import { Resource as SSTResource } from "sst"
import {
  ensureReadyForSheetGeneration,
  generateContactSheetKey,
  InvalidSheetGenerationData,
  parseFinalizedEvent,
  validatePhotoCount,
} from "./utils"

class ContactSheetGenerator extends Effect.Service<ContactSheetGenerator>()(
  "@blikka/contact-sheet-generator",
  {
    dependencies: [
      SheetCreator.Default,
      Database.Default,
      UploadKVRepository.Default,
      S3Service.Default,
    ],
    effect: Effect.gen(function* () {
      const sheetCreator = yield* SheetCreator
      const db = yield* Database
      const kvStore = yield* UploadKVRepository
      const s3 = yield* S3Service

      const generateContactSheet = Effect.fn(
        "ContactSheetGenerator.generateContactSheet"
      )(function* (params: { domain: string; reference: string }) {
        const kvData = yield* kvStore.getParticipantState(
          params.domain,
          params.reference
        )

        yield* ensureReadyForSheetGeneration(
          kvData,
          params.reference,
          params.domain
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

        const sponsor = yield* db.sponsorsQueries.getLatestSponsorByType({
          marathonId: participant.value.marathonId,
          type: "contact-sheets",
        })

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

        yield* validatePhotoCount(
          params.reference,
          keys,
          participant.value.competitionClass
        )

        const contactSheetBuffer = yield* sheetCreator.createSheet({
          domain: params.domain,
          reference: params.reference,
          keys,
          sponsorKey: Option.isSome(sponsor) ? sponsor.value.key : undefined,
          sponsorPosition: "bottom-right",
          topics,
        })

        const contactSheetKey = generateContactSheetKey(
          params.domain,
          params.reference
        )
        yield* s3.putFile(
          SSTResource.V2ContactSheetsBucket.name,
          generateContactSheetKey(params.domain, params.reference),
          contactSheetBuffer
        )

        yield* db.participantsQueries.updateParticipantByReference({
          reference: params.reference,
          domain: params.domain,
          data: {
            contactSheetKey,
          },
        })
        yield* kvStore.updateParticipantState(params.domain, params.reference, {
          contactSheetKey,
        })
      })

      return {
        generateContactSheet,
      }
    }),
  }
) {}

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const contactSheetGenerator = yield* ContactSheetGenerator
    yield* Effect.forEach(
      event.Records,
      (record) =>
        parseFinalizedEvent(record.body).pipe(
          Effect.flatMap((args) =>
            contactSheetGenerator.generateContactSheet(args)
          )
        ),
      { concurrency: 2 }
    )
  }).pipe(
    Effect.withSpan("contactSheetGenerator.handler"),
    Effect.catchAll((error) =>
      Effect.logError("Contact Sheet Generator Error:", error)
    )
  )

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: ContactSheetGenerator.Default,
})
