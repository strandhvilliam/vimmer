import { LambdaHandler } from "@effect-aws/lambda"
import { Effect, Layer, Option, Schema } from "effect"
import { SQSEvent } from "@effect-aws/lambda"
import { Database, RuleConfig } from "@blikka/db"
import { UploadKVRepository } from "@blikka/kv-store"
import { parseFinalizedEvent } from "./utils"
import {
  RuleKeySchema,
  ValidationEngine,
  ValidationInput,
  ValidationRule,
} from "@blikka/validation"

const makeValidationInputs = Effect.fn("makeValidationInputs")(function* () {})

const makeValidationRules = Effect.fn("makeValidationRules")(function* (
  rules: RuleConfig[]
) {
  return rules.map((rule) => {
    return {
      ruleKey: rule.ruleKey,
      enabled: rule.enabled,
      severity: rule.severity,
      params: rule.params,
    }
  })
})

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const db = yield* Database
    const kvStore = yield* UploadKVRepository
    const validator = yield* ValidationEngine

    yield* Effect.forEach(event.Records, (record) =>
      Effect.gen(function* () {
        const { domain, reference } = yield* parseFinalizedEvent(record.body)

        const participantStateOpt = yield* kvStore.getParticipantState(
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

        const rules = yield* db.rulesQueries.getRulesByDomain({
          domain,
        })

        const validationRules = yield* makeValidationRules(rules)

        const validationResults = yield* validator.runValidations()
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
  ValidationEngine.Default
)

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: MainLayer,
})
