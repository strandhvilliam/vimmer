"use client"

import type { QueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"

import type { AppRouter } from "@blikka/api-v2/trpc/routers/_app"

import { createQueryClient } from "./query-client"

let clientQueryClientSingleton: QueryClient | undefined = undefined
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= createQueryClient())
  }
}

export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>()

export function TRPCReactProvider(props: { children: React.ReactNode; sessionToken: string }) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          url: getBaseUrl() + "trpc",
          headers() {
            const headers = new Headers()
            headers.set("x-trpc-source", "blikka-web")
            headers.set("Authorization", `Bearer ${props.sessionToken}`)
            return headers
          },
        }),
      ],
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}

const getBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_TRPC_API_URL ||
    "https://ahjtvn7n4ujnjwzptczktatuh40aefbq.lambda-url.eu-north-1.on.aws/"
  )
}
