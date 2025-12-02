import "server-only"

import type { TRPCQueryOptions } from "@trpc/tanstack-react-query"
import { cache } from "react"
import { headers } from "next/headers"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import { Effect } from "effect"

import type { AppRouter } from "@blikka/api-v2/trpc/routers/_app"
import { createQueryClient } from "./query-client"

// =============================================================================
// Configuration
// =============================================================================

/**
 * TRPC API URL - matches the URL used in the client.
 * This should be the external TRPC server URL.
 */
const TRPC_API_URL =
  process.env.NEXT_PUBLIC_TRPC_API_URL ||
  "https://ahjtvn7n4ujnjwzptczktatuh40aefbq.lambda-url.eu-north-1.on.aws/"

// =============================================================================
// Query Client
// =============================================================================

export const getQueryClient = cache(createQueryClient)

// =============================================================================
// Server TRPC Client (HTTP-based, for external TRPC server)
// =============================================================================

/**
 * Creates a server-side TRPC proxy client.
 * This uses HTTP to call the external TRPC server (not direct router calls).
 */
const createServerTRPCClient = cache(() => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: TRPC_API_URL + "trpc",
        async headers() {
          const hdrs = await headers()
          const result = new Headers()
          result.set("x-trpc-source", "nextjs-rsc")

          // Forward auth-related headers
          const authHeader = hdrs.get("authorization")
          if (authHeader) {
            result.set("authorization", authHeader)
          }

          const cookie = hdrs.get("cookie")
          if (cookie) {
            result.set("cookie", cookie)
          }

          return result
        },
      }),
    ],
  })
})

// =============================================================================
// TRPC Options Proxy (for prefetching with TanStack Query)
// =============================================================================

/**
 * TRPC options proxy for server-side prefetching.
 * Use this to generate query options for prefetching.
 *
 * @example
 * ```tsx
 * // In a server component
 * prefetch(trpc.participants.getById.queryOptions({ id: 123 }))
 *
 * return (
 *   <HydrateClient>
 *     <ClientComponent />
 *   </HydrateClient>
 * )
 * ```
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
  queryClient: getQueryClient,
  client: createServerTRPCClient(),
})

// =============================================================================
// Server API Client (for direct server-side calls)
// =============================================================================

/**
 * Get the server-side TRPC client for direct queries.
 * Use this when you need to call TRPC procedures directly in server components
 * without going through the prefetch/hydration pattern.
 *
 * @example
 * ```tsx
 * // In a server component
 * const api = getServerApi()
 * const data = await api.participants.getById.query({ id: 123 })
 * ```
 */
export const getServerApi = createServerTRPCClient

export type ServerApi = ReturnType<typeof getServerApi>

// =============================================================================
// Hydration Components
// =============================================================================

/**
 * Wraps children with HydrationBoundary to transfer prefetched data to client.
 * Use this in server components to hydrate prefetched queries.
 *
 * @example
 * ```tsx
 * export default async function Page() {
 *   prefetch(trpc.participants.getAll.queryOptions())
 *
 *   return (
 *     <HydrateClient>
 *       <ClientComponent />
 *     </HydrateClient>
 *   )
 * }
 * ```
 */
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>
}

// =============================================================================
// Prefetch Helpers
// =============================================================================

/**
 * Prefetch a single TRPC query.
 * The prefetched data will be available to client components via HydrateClient.
 *
 * @example
 * ```tsx
 * // In a server component
 * prefetch(trpc.participants.getById.queryOptions({ id: 123 }))
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
  const queryClient = getQueryClient()
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any)
  } else {
    void queryClient.prefetchQuery(queryOptions)
  }
}

/**
 * Prefetch multiple TRPC queries in a single batch.
 * More efficient than calling prefetch multiple times.
 *
 * @example
 * ```tsx
 * // In a server component
 * batchPrefetch([
 *   trpc.participants.getById.queryOptions({ id: 123 }),
 *   trpc.marathons.getByDomain.queryOptions({ domain: "test" }),
 * ])
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function batchPrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptionsArray: T[]) {
  const queryClient = getQueryClient()

  for (const queryOptions of queryOptionsArray) {
    if (queryOptions.queryKey[1]?.type === "infinite") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      void queryClient.prefetchInfiniteQuery(queryOptions as any)
    } else {
      void queryClient.prefetchQuery(queryOptions)
    }
  }
}

// =============================================================================
// Re-exports for convenience
// =============================================================================

// Re-export the Effect-based TRPC client utilities
export { TRPCClient, TRPCClientError } from "./effect-client"
