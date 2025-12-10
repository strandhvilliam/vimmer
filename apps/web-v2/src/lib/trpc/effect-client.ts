import "server-only"

import { Context, Effect, Layer, Data, Config } from "effect"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import type { AppRouter } from "../../../../../packages/api-v2/src/trpc/routers/_app"
import { headers } from "next/headers"
import { getAppSession } from "../auth/server"

// =============================================================================
// Types
// =============================================================================

/** The raw TRPC proxy client type */
type TRPCProxyClient = ReturnType<typeof createTRPCProxyClient<AppRouter>>

// =============================================================================
// Errors
// =============================================================================

export class TRPCServerError extends Data.TaggedError("TRPCClientError")<{
  message: string
  cause?: unknown
}> {}

// =============================================================================
// Configuration
// =============================================================================

/**
 * TRPC API URL configuration.
 * By default reads from NEXT_PUBLIC_TRPC_API_URL environment variable.
 */
export const TRPCApiUrl = Config.string("NEXT_PUBLIC_TRPC_API_URL").pipe(
  Config.withDefault("https://ahjtvn7n4ujnjwzptczktatuh40aefbq.lambda-url.eu-north-1.on.aws/")
)

// =============================================================================
// TRPC Client Service
// =============================================================================

/**
 * Effect Service for TRPC client.
 *
 * This provides an HTTP-based TRPC client that can be used in Effect functions
 * for server-side queries. The client is configured to work with Next.js
 * server components and forwards headers for authentication.
 *
 * @example
 * ```ts
 * const getParticipants = Effect.gen(function* () {
 *   const trpc = yield* TRPCClient
 *   return yield* trpc.query((client) =>
 *     client.participants.getByDomainInfinite.query({ domain: "test" })
 *   )
 * })
 * ```
 */
export class TRPCClient extends Effect.Service<TRPCClient>()("@blikka/web-v2/TRPCClient", {
  effect: Effect.gen(function* () {
    const apiUrl = yield* TRPCApiUrl

    return createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: apiUrl + "trpc",
          async headers() {
            // Forward headers from the incoming request for auth
            const hdrs = await headers()

            // return hdrs
            return new Headers()
          },
        }),
      ],
    })

    // const wrapCall = <T>(
    //   fn: (client: TRPCProxyClient) => Promise<T>
    // ): Effect.Effect<T, TRPCServerError> =>
    //   Effect.tryPromise({
    //     try: () => fn(client),
    //     catch: (error) =>
    //       new TRPCServerError({
    //         message: error instanceof Error ? error.message : "TRPC call failed",
    //         cause: error,
    //       }),
    //   })

    // return {
    //   client,
    //   query: wrapCall,
    //   mutate: wrapCall,
    // }
  }),
}) {}
