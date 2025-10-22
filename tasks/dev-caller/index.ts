import { LambdaHandler } from "@effect-aws/lambda"
import { Resource as SSTResource } from "sst"
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge"
import { Effect, Layer } from "effect"
import { BusService } from "@blikka/bus"

export const effectHandler = () =>
  Effect.gen(function* () {
    const bus = yield* BusService
    const result = yield* bus.sendFinalizedEvent("uppis", "5432")
    return Effect.succeed(void 0)
  }).pipe(Effect.withSpan("DevCaller.handler"), Effect.catchAll(Effect.logError))

export const handler = LambdaHandler.make({
  handler: effectHandler,
  layer: BusService.Default,
})
