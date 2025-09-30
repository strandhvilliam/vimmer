import { LambdaHandler } from "@effect-aws/lambda";
import { Effect } from "effect";
import { SQSEvent } from "@effect-aws/lambda";
import { parseFinalizedEvent } from "./utils";
import { ValidationRunner } from "./service";

const effectHandler = (event: SQSEvent) =>
  Effect.gen(function* () {
    const validationRunner = yield* ValidationRunner;

    yield* Effect.forEach(event.Records, (record) =>
      parseFinalizedEvent(record.body).pipe(
        Effect.flatMap(({ domain, reference }) =>
          validationRunner.execute(domain, reference),
        ),
      ),
    );
  }).pipe(
    Effect.withSpan("validationRunner.handler"),
    Effect.catchAll((error) =>
      Effect.logError("Validation Runner Error:", error),
    ),
  );

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: ValidationRunner.Default,
});
