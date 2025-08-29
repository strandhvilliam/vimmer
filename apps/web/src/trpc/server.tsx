import "server-only";
import { cache } from "react";
import { createQueryClient } from "./query-client";
import {
  createTRPCOptionsProxy,
  TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AppRouter } from "@vimmer/api/trpc/routers/_app";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";

import { Resource } from "sst";
import superjson from "superjson";
import { headers } from "next/headers";

export const getQueryClient = cache(createQueryClient);

export const createServerApiClient = () => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      // loggerLink({
      //   console: console,
      //   enabled: (op) =>
      //     process.env.NODE_ENV === "development" ||
      //     (op.direction === "down" && op.result instanceof Error),
      // }),
      // retryLink({
      //   retry(opts) {
      //     if (opts.error.data && opts.error.data.httpStatus !== 429) {
      //       return false
      //     }
      //     if (opts.op.type !== "query") {
      //       return false
      //     }
      //     return opts.attempts <= 3
      //   },
      //   retryDelayMs: (attemptIndex) =>
      //     Math.min(2000 * 2 ** attemptIndex, 30000),
      // }),
      httpBatchLink({
        transformer: superjson,
        url: Resource.Api.url + "trpc",
        async headers() {
          return headers();
        },
      }),
    ],
  });
};

export type ServerApiClient = ReturnType<typeof createServerApiClient>;

export const trpc = createTRPCOptionsProxy<AppRouter>({
  queryClient: getQueryClient,
  client: createServerApiClient(),
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function batchPrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptionsArray: T[],
) {
  const queryClient = getQueryClient();

  for (const queryOptions of queryOptionsArray) {
    if (queryOptions.queryKey[1]?.type === "infinite") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      void queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
      void queryClient.prefetchQuery(queryOptions);
    }
  }
}
