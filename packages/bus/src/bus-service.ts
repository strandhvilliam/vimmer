import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge"
import { Data, Effect } from "effect"
import { Console } from "effect"
import { Resource as SSTResource } from "sst"
import { EventBridgeEffectClient } from "./eventbridge-effect-client"

export class EventBusError extends Data.TaggedError("EventBusError")<{
  message?: string
  cause?: unknown
}> {}

export class BusService extends Effect.Service<BusService>()(
  "@blikka/bus/bus-service",
  {
    dependencies: [EventBridgeEffectClient.Default],
    effect: Effect.gen(function* () {
      const eb = yield* EventBridgeEffectClient

      const sendFinalizedEvent = Effect.fn("BusService.sendFinalizedEvent")(
        function* (domain: string, reference: string) {
          const command = new PutEventsCommand({
            Entries: [
              {
                EventBusName: SSTResource.SubmissionFinalizedBus.name,
                Source: "blikka.bus.finalized",
                Detail: JSON.stringify({ domain, reference }),
              },
            ],
          })

          return yield* eb.use(async (eb) => eb.send(command))
        },
        Effect.catchTag("EventBridgeEffectError", (error) => {
          return new EventBusError({
            cause: error,
            message: "Unexpected EventBridge error",
          })
        })
      )

      return {
        sendFinalizedEvent,
      }
    }),
  }
) {}
