import { Config, Data, Effect } from "effect"
import {
  createClient as createSupabaseClient,
  SupabaseClient as SupabaseDbClient,
} from "@supabase/supabase-js"

export class SupabaseError extends Data.TaggedError("SupabaseError")<{
  message?: string
  cause?: unknown
}> {}

export class SupabaseClient extends Effect.Service<SupabaseClient>()(
  "@blikka/db/supabase-client",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      const url = yield* Config.string("SUPABASE_URL")
      const anonKey = yield* Config.string("SUPABASE_ANON_KEY")

      const client = createSupabaseClient(url, anonKey)

      const use = <T>(
        fn: (client: SupabaseDbClient) => T
      ): Effect.Effect<Awaited<T>, SupabaseError, never> =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (error) =>
              new SupabaseError({
                cause: error,
                message: "Supabase.use error (Sync)",
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new SupabaseError({
                  cause: e,
                  message: "Supabase.use error (Async)",
                }),
            })
          } else {
            return result
          }
        })

      return {
        use,
      }
    }),
  }
) {}
