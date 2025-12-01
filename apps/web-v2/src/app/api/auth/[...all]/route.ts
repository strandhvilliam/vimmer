import { Auth } from "@/lib/auth/server"
import { Route } from "@/lib/runtime"
import { Effect } from "effect"
import { NextRequest } from "next/server"

const _route = Effect.fn("@blikka/web/authRoute")(function* (req: NextRequest) {
  const auth = yield* Auth
  return auth.handler(req)
})

export const GET = Route(_route)
export const POST = Route(_route)
