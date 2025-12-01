import { LoginForm } from "./login-form"
import { Page } from "@/lib/runtime"
import { Effect, Schema } from "effect"
import { decodeSearchParams } from "@/lib/utils"

const _LoginPage = Effect.fn("@blikka/web/LoginPage")(
  function* (props: { searchParams: Promise<Record<string, string | Array<string> | undefined>> }) {
    const searchParams = yield* decodeSearchParams(
      Schema.Struct({
        error: Schema.optional(Schema.String),
      })
    )(props)

    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm error={searchParams.error} />
        </div>
      </div>
    )
  },
  Effect.catchAll((error) => Effect.succeed(<div>Error: {error.message}</div>))
)

export default Page(_LoginPage)
