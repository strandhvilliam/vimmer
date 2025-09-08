import { S3Client } from "@aws-sdk/client-s3"
import { Config, Data, Effect } from "effect"

export class S3EffectError extends Data.TaggedError("S3EffectError")<{
  message?: string
  cause?: unknown
}> {}

export class S3EffectClient extends Effect.Service<S3EffectClient>()(
  "@blikka/packages/s3-service/s3-effect-client",
  {
    effect: Effect.gen(function* () {
      const region = yield* Config.string("AWS_REGION")

      const client = new S3Client({ region })

      const use = <T>(
        fn: (client: S3Client) => T
      ): Effect.Effect<Awaited<T>, S3EffectError, never> =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (error) =>
              new S3EffectError({
                cause: error,
                message: "S3.use error (Sync)",
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new S3EffectError({
                  cause: e,
                  message: "S3.use error (Async)",
                }),
            })
          }
          return result
        })

      return {
        use,
      }
    }),
  }
) {}
