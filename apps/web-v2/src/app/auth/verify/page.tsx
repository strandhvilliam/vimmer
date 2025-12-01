import { getAppSession } from "@/lib/auth/server"
import { Page } from "@/lib/runtime"
import { Effect, Option, Schema } from "effect"
import { redirect } from "next/navigation"
import { decodeSearchParams } from "@/lib/utils"

const _VerifyPage = Page(
  Effect.fn("@blikka/web/VerifyPage")(function* (props: {
    searchParams: Promise<Record<string, string | Array<string> | undefined>>
  }) {
    // Check for error in query params (Better Auth might pass error if verification failed)
    const searchParams = yield* decodeSearchParams(
      Schema.Struct({
        error: Schema.optional(Schema.String),
        token: Schema.optional(Schema.String),
      })
    )(props).pipe(Effect.catchAll(() => Effect.succeed({ error: undefined, token: undefined })))

    if (searchParams.error) {
      // If there's an error, redirect to login with error message
      redirect(`/auth/login?error=${encodeURIComponent(searchParams.error)}`)
    }

    // Check if user is authenticated (Better Auth should have verified the magic link already)
    const session = yield* getAppSession()

    if (Option.isNone(session)) {
      // If not authenticated, redirect to login
      redirect("/auth/login?error=verification_failed")
    }

    // Redirect to marathon page which will show available domains
    redirect("/marathon/page")
  })
)

export default _VerifyPage
