import { LambdaHandler } from "@effect-aws/lambda"
import { Effect, Layer, Option, Schema } from "effect"
import { SQSEvent } from "@effect-aws/lambda"
import { Database, RuleConfig } from "@blikka/db"
import {
  ExifKVRepository,
  SubmissionState,
  ExifState,
  UploadKVRepository,
} from "@blikka/kv-store"
import {
  InvalidDataFoundError,
  InvalidValidationRuleError,
  makeValidationRules,
  parseFinalizedEvent,
} from "./utils"
import { S3Service } from "@blikka/s3"
import { Resource as SSTResource } from "sst"
import {
  RuleKeySchema,
  ValidationEngine,
  ValidationInput,
  ValidationInputSchema,
  ValidationRule,
  ValidationRuleSchema,
} from "@blikka/validation"
import { KVStore } from "@blikka/kv-store"

class ValidationRunner extends Effect.Service<ValidationRunner>()(
  "@blikka/validation-runner",
  {
    dependencies: [
      Database.Default,
      S3Service.Default,
      KVStore.Default,
      ValidationEngine.Default,
    ],
    effect: Effect.gen(function* () {
      const db = yield* Database
      const s3 = yield* S3Service
      const kv = yield* KVStore
      const validator = yield* ValidationEngine

      const makeValidationRules = Effect.fn(
        "ValidationRunner.makeValidationRules"
      )(
        function* (rules: RuleConfig[]) {
          const validationRules: ValidationRule[] = []
          for (const rule of rules) {
            const validationRule = yield* Schema.decodeUnknown(RuleKeySchema)(
              rule.ruleKey
            )
            const parsed = yield* Schema.decodeUnknown(
              ValidationRuleSchema(validationRule)
            )({
              ruleKey: validationRule,
              enabled: rule.enabled,
              severity: rule.severity,
              params: rule.params,
            })
            validationRules.push(parsed)
          }
          return validationRules
        },
        Effect.mapError(
          (error) => new InvalidValidationRuleError({ message: error.message })
        )
      )

      const makeValidationInputs = Effect.fn(
        "ValidationRunner.makeValidationInputs"
      )(function* (
        exifStates: { orderIndex: string; exif: ExifState }[],
        submissionStates: readonly SubmissionState[]
      ) {
        const validationInputs: ValidationInput[] = []

        for (const submissionState of submissionStates) {
          const exifState = exifStates.find(
            (e) => e.orderIndex === `${submissionState.orderIndex}`
          )

          const head = yield* s3.getHead(
            SSTResource.V2SubmissionsBucket.name,
            submissionState.key
          )

          const mimeType = head.ContentType
          const fileSize = head.ContentLength
          const fileName = submissionState.key

          const validationInput = ValidationInputSchema.make({
            exif: exifState?.exif ?? {},
            fileName,
            mimeType: mimeType ?? "image/jpeg",
            fileSize: fileSize ?? 0,
            orderIndex: submissionState.orderIndex,
          })
          validationInputs.push(validationInput)
        }
        return validationInputs
      })

      const runValidations = Effect.fn("ValidationRunner.runValidations")(
        function* (domain: string, reference: string) {
          const participantStateOpt =
            yield* kv.uploadRepository.getParticipantState(domain, reference)

          if (
            Option.isSome(participantStateOpt) &&
            participantStateOpt.value.validated
          ) {
            yield* Effect.log("Participant already validated, skipping")
            return
          }

          if (Option.isNone(participantStateOpt)) {
            return yield* Effect.fail(
              new InvalidDataFoundError({
                message: `Participant not found for reference ${reference} and domain ${domain}`,
              })
            )
          }

          const rules = yield* db.rulesQueries.getRulesByDomain({
            domain,
          })
          const orderIndexes = participantStateOpt.value.processedIndexes.map(
            (_, i) => `${i}`
          )

          const [exifStates, submissionStates] = yield* Effect.all(
            [
              kv.exifRepository.getAllExifStates(
                domain,
                reference,
                orderIndexes
              ),
              kv.uploadRepository.getAllSubmissionStates(
                domain,
                reference,
                orderIndexes
              ),
            ],
            { concurrency: 2 }
          )

          if (exifStates.length === 0 || submissionStates.length === 0) {
            return yield* new InvalidDataFoundError({
              message: `Exif states or submission states not found for reference ${reference} and domain ${domain}`,
            })
          }

          const [validationInputs, validationRules] = yield* Effect.all(
            [
              makeValidationInputs(exifStates, submissionStates),
              makeValidationRules(rules),
            ],
            { concurrency: 2 }
          )

          const validationResults = yield* validator.runValidations(
            validationRules,
            validationInputs
          )
          const participant =
            yield* db.participantsQueries.getParticipantByReference({
              reference,
              domain,
            })

          if (Option.isNone(participant)) {
            return yield* Effect.fail(
              new InvalidDataFoundError({
                message: `Participant not found for reference ${reference} and domain ${domain}`,
              })
            )
          }

          yield* db.validationsQueries.createMultipleValidationResults({
            data: validationResults.map((r) => ({
              ...r,
              participantId: participant.value.id,
            })),
          })
        }
      )
      return {
        runValidations,
      }
    }),
  }
) {}

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const validationRunner = yield* ValidationRunner

    yield* Effect.forEach(event.Records, (record) =>
      parseFinalizedEvent(record.body).pipe(
        Effect.flatMap(({ domain, reference }) =>
          validationRunner.runValidations(domain, reference)
        )
      )
    )
  }).pipe(
    Effect.withSpan("validationRunner.handler"),
    Effect.catchAll((error) =>
      Effect.logError("Validation Runner Error:", error)
    )
  )

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: ValidationRunner.Default,
})
