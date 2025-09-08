# Validation Engine Usage

The new validation architecture is separated into distinct services with clear responsibilities:

## Architecture

- **ValidationEngine**: Pure validation logic, returns simple Effect outcomes (success `void`, or failure with `ValidationFailure`/`ValidationSkipped`)
- **ResultFormatter**: Formats validation outcomes into `ValidationResult` objects with severity and messages
- **ValidationOrchestrator**: Coordinates validation and formatting, handles rule configuration

## Basic Usage

```typescript
import { Effect } from "effect"
import {
  ValidationOrchestrator,
  ValidationEngine,
  ResultFormatter,
  RULE_KEYS,
  type ValidationInput,
  type ValidationRule,
} from "@vimmer/validation"

// Create validation input
const input: ValidationInput = {
  exif: {
    Make: "Sony",
    Model: "Alpha A7III",
    DateTimeOriginal: "2023-06-15T14:30:00Z",
    CreateDate: "2023-06-15T14:30:00Z",
  },
  fileName: "photo.jpg",
  fileSize: 5000000, // 5MB
  orderIndex: 0,
  mimeType: "image/jpeg",
}

// Define validation rules
const rules: ValidationRule[] = [
  {
    ruleKey: RULE_KEYS.MAX_FILE_SIZE,
    enabled: true,
    severity: "error",
    params: { maxBytes: 10000000 }, // 10MB limit
  },
  {
    ruleKey: RULE_KEYS.ALLOWED_FILE_TYPES,
    enabled: true,
    severity: "warning",
    params: { allowedFileTypes: ["jpg", "jpeg", "png"] },
  },
]

// Run validation
const program = Effect.gen(function* () {
  const orchestrator = yield* ValidationOrchestrator

  // Validate single input
  const singleResult = yield* orchestrator.validateSingle(rules[0], input)

  // Validate multiple inputs with all rules
  const allResults = yield* orchestrator.validateAll(rules, [input])

  return { singleResult, allResults }
})

// Execute with services
const result = await Effect.runPromise(
  program.pipe(
    Effect.provide(ValidationOrchestrator.Default),
    Effect.provide(ValidationEngine.Default),
    Effect.provide(ResultFormatter.Default)
  )
)
```

## Direct Engine Usage

For advanced use cases, you can use the ValidationEngine directly:

```typescript
const engineProgram = Effect.gen(function* () {
  const engine = yield* ValidationEngine

  // Returns Effect<void, ValidationFailure>
  const result = yield* Effect.either(
    engine[RULE_KEYS.MAX_FILE_SIZE]({ maxBytes: 10000000 }, input)
  )

  if (result._tag === "Left") {
    // Validation failed
    console.log("Failed:", result.left.message)
  } else {
    // Validation passed
    console.log("Passed!")
  }
})
```

## Custom Formatting

You can use the ResultFormatter independently:

```typescript
const formatterProgram = Effect.gen(function* () {
  const formatter = yield* ResultFormatter

  // Format different outcomes
  const successResult = formatter.formatSuccess(
    RULE_KEYS.MAX_FILE_SIZE,
    "error"
  )
  const failureResult = formatter.formatFailure(
    new ValidationFailure({
      ruleKey: RULE_KEYS.MAX_FILE_SIZE,
      message: "File too large",
      context: { fileSize: 15000000 },
    }),
    "error"
  )

  return { successResult, failureResult }
})
```

## Key Benefits

1. **Separation of Concerns**: Engine only validates, formatter only formats, orchestrator coordinates
2. **No Severity in Engine**: Engine doesn't care about severity levels - that's the formatter's job
3. **Simple Outcomes**: Engine returns simple success (void) or typed failures
4. **Composable**: Each service can be used independently or composed together
5. **Type Safe**: Full TypeScript support with proper error types
