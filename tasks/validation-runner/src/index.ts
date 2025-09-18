import { LambdaHandler } from "@effect-aws/lambda"
import { Effect, Layer, Option, Schema } from "effect"
import { SQSEvent } from "@effect-aws/lambda"
import { Database, RuleConfig } from "@blikka/db"
import { ExifKVRepository, UploadKVRepository } from "@blikka/kv-store"
import { InvalidDataFoundError, parseFinalizedEvent } from "./utils"
import { S3Service } from "@blikka/s3"
import { SSTResource } from "sst"
import {
  RuleKeySchema,
  ValidationEngine,
  ValidationInput,
  ValidationInputSchema,
  ValidationRule,
  ValidationRuleSchema,
} from "@blikka/validation"

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const db = yield* Database
    const s3 = yield* S3Service
    const uploadKv = yield* UploadKVRepository
    const exifKv = yield* ExifKVRepository
    const validator = yield* ValidationEngine

    yield* Effect.forEach(event.Records, (record) =>
      Effect.gen(function* () {
        const { domain, reference } = yield* parseFinalizedEvent(record.body)

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

        const numberOfSubmissions =
          participantStateOpt.value.processedIndexes.length

        const validationInputs = []

        for (let i = 0; i < numberOfSubmissions; i++) {
          const exifState = exifStates.find((e) => e.orderIndex === `${i}`)
          const submissionState = yield* uploadKv.getSubmissionState(
            domain,
            reference,
            `${i}`
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

        const validationRules = []

        for (const rule of rules) {
          const validationRule = yield* Schema.decodeUnknown(ValidationKe)(rule)
          validationRules.push({
            ruleKey: validationRule.ruleKey,
            enabled: rule.enabled,
            severity: rule.severity,
            params: rule.params,
          })
        }

        const validationResults = yield* validator.runValidations(
          validationRules,
          inputs
        )
      })
    )
  }).pipe(
    Effect.withSpan("contactSheetGenerator.handler"),
    Effect.catchAll((error) =>
      Effect.logError("Contact Sheet Generator Error:", error)
    )
  )

const MainLayer = Layer.mergeAll(
  Database.Default,
  UploadKVRepository.Default,
  ValidationEngine.Default,
  S3Service.Default
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: MainLayer,
})
