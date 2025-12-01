import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Effect, Schema } from "effect"
import { getLocale as getLocaleServer } from "next-intl/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type NextBaseParams = Promise<Record<string, string | Array<string> | undefined>>

type NextBaseSearchParams = {
  searchParams: Promise<Record<string, string | Array<string> | undefined>>
}

export const decodeParams =
  <T, P extends NextBaseParams>(schema: Schema.Schema<T>) =>
  (p: P) =>
    Effect.gen(function* () {
      const params = yield* Effect.promise(() => p)
      return yield* Schema.decodeUnknown(schema)(params)
    })

export const decodeSearchParams =
  <T, P extends NextBaseSearchParams>(schema: Schema.Schema<T>) =>
  (props: P) =>
    Effect.gen(function* () {
      const searchParams = yield* Effect.promise(() => props.searchParams)
      return yield* Schema.decodeUnknown(schema)(searchParams)
    })
