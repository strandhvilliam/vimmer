import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { Config, Console, Data, Effect } from "effect";

export class EventBridgeEffectError extends Data.TaggedError(
  "EventBridgeEffectError",
)<{
  message?: string;
  cause?: unknown;
}> {}

export class EventBridgeEffectClient extends Effect.Service<EventBridgeEffectClient>()(
  "@blikka/packages/s3-service/s3-effect-client",
  {
    scoped: Effect.gen(function* () {
      const region = yield* Config.string("AWS_REGION");

      const client = new EventBridgeClient({ region });

      const use = <T>(
        fn: (client: EventBridgeClient) => T,
      ): Effect.Effect<Awaited<T>, EventBridgeEffectError, never> =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (error) =>
              new EventBridgeEffectError({
                cause: error,
                message: "EventBridge.use error (Sync)",
              }),
          });
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new EventBridgeEffectError({
                  cause: e,
                  message: "EventBridge.use error (Async)",
                }),
            });
          }
          return result;
        });

      yield* Effect.addFinalizer(() =>
        Console.log("Shutting down EventBridge client"),
      );

      return {
        use,
      };
    }),
  },
) {}
