import { Effect } from "effect"

export class ExampleService extends Effect.Service<ExampleService>()(
  "@blikka/api-v2/example-service",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      const ping = Effect.fn("ExampleService.ping")(function* () {
        return "pong"
      })
      return {
        ping,
      }
    }),
  }
) {}
