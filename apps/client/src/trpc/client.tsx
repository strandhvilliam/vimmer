import "client-only";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./query-client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { AppRouter } from "@vimmer/api/trpc/routers/_app";
import { useState } from "react";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

let clientQueryClientSingleton: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  } else {
    return (clientQueryClientSingleton ??= createQueryClient());
  }
};

export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCProxyClient<AppRouter>({
      links: [
        // loggerLink({
        //   enabled: (op) =>
        //     process.env.NODE_ENV === "development" ||
        //     (op.direction === "down" && op.result instanceof Error),
        // }),
        httpBatchLink({
          transformer: superjson,
          url: process.env.NEXT_PUBLIC_API_URL + "trpc",
          async headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
