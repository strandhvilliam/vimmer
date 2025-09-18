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

class ValidationRunner extends Effect.Service<ValidationRunner>()(
  "@blikka/validation-runner",
  {
    dependencies: [
      Database.Default,
      S3Service.Default,
      UploadKVRepository.Default,
      ExifKVRepository.Default,
      ValidationEngine.Default,
    ],
    effect: Effect.gen(function* () {
      const db = yield* Database
      const s3 = yield* S3Service
      const uploadKv = yield* UploadKVRepository
      const exifKv = yield* ExifKVRepository
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
      )(function* (exifStates: ExifState[]) {})

      const runValidations = Effect.fn("ValidationRunner.runValidations")(
        function* (domain: string, reference: string) {
          const participantStateOpt = yield* uploadKv.getParticipantState(
            domain,
            reference
          )

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

          const exifStates = yield* exifKv.getAllExifStates(
            domain,
            reference,
            participantStateOpt.value.processedIndexes.map((_, i) => `${i}`)
          )

          const submissionStates = yield* uploadKv.getAllSubmissionStates(
            domain,
            reference,
            participantStateOpt.value.processedIndexes.map((_, i) => `${i}`)
          )

          const numberOfSubmissions =
            participantStateOpt.value.processedIndexes.length

          const validationInputs = []

          for (let i = 0; i < numberOfSubmissions; i++) {
            const exifState = exifStates.find((e) => e.orderIndex === `${i}`)
            const submissionState = submissionStates.find(
              (s) => s.orderIndex === `${i}`
            )

            if (Option.isNone(submissionState)) {
              return yield* Effect.fail(
                new InvalidDataFoundError({
                  message: `Submission not found for reference ${reference} and domain ${domain}`,
                })
              )
            }

            const head = yield* s3.getHead(
              SSTResource.V2SubmissionsBucket.name,
              submissionState.value.key
            )

            const mimeType = head.ContentType
            const fileSize = head.ContentLength
            const fileName = submissionState.value.key

            const validationInput = ValidationInputSchema.make({
              exif: exifState?.exif ?? {},
              fileName,
              mimeType: mimeType ?? "image/jpeg",
              fileSize: fileSize ?? 0,
              orderIndex: i,
            })
            validationInputs.push(validationInput)
          }

          const validationRules = yield* makeValidationRules(rules)

          const validationResults = yield* validator.runValidations(
            validationRules,
            validationInputs
          )

          return validationResults
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
    Effect.withSpan("contactSheetGenerator.handler"),
    Effect.catchAll((error) =>
      Effect.logError("Contact Sheet Generator Error:", error)
    )
  )

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: ValidationRunner.Default,
})
