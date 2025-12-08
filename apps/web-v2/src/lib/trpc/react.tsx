"use client"

import type { QueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"

import type { AppRouter } from "@blikka/api-v2/trpc/routers/_app"

import { createQueryClient } from "./query-client"
import { Session } from "@blikka/auth"

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

export function TRPCReactProvider(props: { children: React.ReactNode; headers: Headers }) {
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
            const headers = new Map(props.headers)
            headers.set("x-trpc-source", "blikka-web")
            const cookieString = headers.get("cookie")
            if (cookieString) {
              const token = cookieString
                .split("; ")
                .find((row: string) => row.startsWith("better-auth.session_token="))
                ?.split("=")[1]

              if (token) {
                headers.set("Authorization", `Bearer ${token}`)
              }
            }

            return Object.fromEntries(headers)
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
  // Use environment variable if available, otherwise fall back to default
  return (
    process.env.NEXT_PUBLIC_TRPC_API_URL ||
    "https://ahjtvn7n4ujnjwzptczktatuh40aefbq.lambda-url.eu-north-1.on.aws/"
  )
}
