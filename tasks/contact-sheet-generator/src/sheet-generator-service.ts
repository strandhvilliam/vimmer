import { Effect, Option } from "effect"
import { SheetBuilder } from "./sheet-builder"
import { Database } from "@blikka/db"
import { UploadKVRepository } from "@blikka/kv-store"
import { S3Service } from "@blikka/s3"
import { Resource as SSTResource } from "sst"
import {
  ensureReadyForSheetGeneration,
  generateContactSheetKey,
  InvalidSheetGenerationData,
  validatePhotoCount,
} from "./utils"

export class SheetGeneratorService extends Effect.Service<SheetGeneratorService>()(
  "@blikka/contact-sheet-generator/sheet-generator-service",
  {
    dependencies: [
      SheetBuilder.Default,
      Database.Default,
      UploadKVRepository.Default,
      S3Service.Default,
    ],
    effect: Effect.gen(function* () {
      const sheetBuilder = yield* SheetBuilder
      const db = yield* Database
      const kvStore = yield* UploadKVRepository
      const s3 = yield* S3Service

      const generateContactSheet = Effect.fn("SheetGeneratorService.generateContactSheet")(
        function* (params: { domain: string; reference: string }) {
          const participantState = yield* kvStore
            .getParticipantState(params.domain, params.reference)
            .pipe(
              Effect.andThen(
                Option.getOrThrowWith(
                  () =>
                    new InvalidSheetGenerationData({
                      message: `Participant state not found for reference ${params.reference} and domain ${params.domain}`,
                    })
                )
              )
            )

          const { shouldSkip } = yield* ensureReadyForSheetGeneration(
            participantState,
            params.reference,
            params.domain
          )

          if (shouldSkip) {
            return yield* Effect.log(
              `Skipping contact sheet generation for reference ${params.reference} and domain ${params.domain}`
            )
          }

          const participant = yield* db.participantsQueries
            .getParticipantByReference({
              reference: params.reference,
              domain: params.domain,
            })
            .pipe(
              Effect.andThen(
                Option.getOrThrowWith(
                  () =>
                    new InvalidSheetGenerationData({
                      message: `Participant not found for reference ${params.reference} and domain ${params.domain}`,
                    })
                )
              )
            )

          const sponsor = yield* db.sponsorsQueries.getLatestSponsorByType({
            marathonId: participant.marathonId,
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

          const keys = participant.submissions.map((s) => s.key)

          yield* validatePhotoCount(params.reference, keys, participant.competitionClass)

          yield* sheetBuilder
            .createSheet({
              domain: params.domain,
              reference: params.reference,
              keys,
              sponsorKey: Option.isSome(sponsor) ? sponsor.value.key : undefined,
              sponsorPosition: "bottom-right",
              topics,
            })
            .pipe(
              Effect.andThen((buffer) =>
                s3.putFile(
                  SSTResource.V2ContactSheetsBucket.name,
                  generateContactSheetKey(params.domain, params.reference),
                  buffer
                )
              )
            )

          const contactSheetKey = generateContactSheetKey(params.domain, params.reference)

          yield* Effect.all([
            db.participantsQueries.updateParticipantByReference({
              reference: params.reference,
              domain: params.domain,
              data: {
                contactSheetKey,
              },
            }),
            kvStore.updateParticipantState(params.domain, params.reference, {
              contactSheetKey,
            }),
          ])
        }
      )

      return {
        generateContactSheet,
      }
    }),
  }
) {}
