import "server-only";
import { cache } from "react";
import { createQueryClient } from "./query-client";
import {
  createTRPCOptionsProxy,
  TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AppRouter } from "@vimmer/api/trpc/routers/_app";
import {
  createTRPCProxyClient,
  httpBatchLink,
  httpBatchStreamLink,
  loggerLink,
} from "@trpc/client";

import { Resource } from "sst";
import superjson from "superjson";

export const getQueryClient = cache(createQueryClient);

export const createServerApiClient = cache(() => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        transformer: superjson,
        url: Resource.Api.url + "trpc",
      }),
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
    ],
  });
});

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
  queryOptions: T
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
  queryOptionsArray: T[]
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
