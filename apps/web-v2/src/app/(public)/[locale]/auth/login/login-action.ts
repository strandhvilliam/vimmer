"use server"

import { Auth } from "@/lib/auth/server"
import { Action, toActionResponse } from "@/lib/runtime"
import { Effect } from "effect"
import { headers } from "next/headers"

const _loginAction = Effect.fn("@blikka/web/loginAction")(function* ({ email }: { email: string }) {
  const auth = yield* Auth
  const readonlyHeaders = yield* Effect.tryPromise(() => headers())
  yield* Effect.tryPromise(() =>
    auth.api.signInMagicLink({
      headers: readonlyHeaders,
      body: {
        email,
      },
    })
  )
}, toActionResponse)

export const loginAction = async (input: { email: string }) => Action(_loginAction)(input)
