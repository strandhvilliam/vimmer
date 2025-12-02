"use server"

import { LOCALE_COOKIE_NAME } from "@/config"
import { Action, toActionResponse } from "@/lib/runtime"
import { Effect } from "effect"
import { cookies } from "next/headers"

const _updateLocaleAction = Effect.fn("@blikka/web/updateLocaleAction")(function* ({
  locale,
}: {
  locale: string
}) {
  const store = yield* Effect.tryPromise(() => cookies())
  store.set(LOCALE_COOKIE_NAME, locale)
}, toActionResponse)

export const updateLocaleAction = Action(_updateLocaleAction)
