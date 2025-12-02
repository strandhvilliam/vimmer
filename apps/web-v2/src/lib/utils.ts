import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Effect, Schema } from "effect"
import { protocol, rootDomain } from "@/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type NextBaseParams = Promise<Record<string, string | Array<string> | undefined>>

type NextBaseSearchParams = Promise<Record<string, string | Array<string> | undefined>>

export const decodeParams =
  <T, P extends NextBaseParams>(schema: Schema.Schema<T>) =>
  (p: P) =>
    Effect.gen(function* () {
      const params = yield* Effect.promise(() => p)
      return yield* Schema.decodeUnknown(schema)(params)
    })

export const decodeSearchParams =
  <T, P extends NextBaseSearchParams>(schema: Schema.Schema<T>) =>
  (search: P) =>
    Effect.gen(function* () {
      const searchParams = yield* Effect.promise(() => search)
      return yield* Schema.decodeUnknown(schema)(searchParams)
    })

export const formatSubdomainUrl = (subdomain: string) => {
  if (process.env.NODE_ENV === "production") {
    return `${protocol}://${subdomain}.${rootDomain}`
  }
  // for local development since we don't have a subdomain
  return `${protocol}://localhost:3002/marathon/${subdomain}`
}
