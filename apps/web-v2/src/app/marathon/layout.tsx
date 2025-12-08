import { getAppSession } from "@/lib/auth/server"
import { Layout } from "@/lib/next-utils"
import { Effect, Option } from "effect"
import { redirect } from "next/navigation"
import Document from "@/components/document"
import { getLocale } from "@/lib/server-utils"
import { TRPCReactProvider } from "@/lib/trpc/react"
import { Providers } from "./providers"
import { getMessages } from "next-intl/server"
import { Suspense } from "react"

const _MarathonLayout = Effect.fn("@blikka/web/MarathonLayout")(
  function* ({ children }: LayoutProps<"/marathon">) {
    const locale = yield* getLocale()
    const session = yield* getAppSession()
    const messages = yield* Effect.tryPromise({
      try: () => getMessages(),
      catch: () => new Error("Failed to get messages"),
    })

    if (Option.isNone(session)) {
      console.log("redirecting to login")
      redirect("/auth/login")
    }

    return (
      <Document locale={locale}>
        <Providers locale={locale} messages={messages}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </Providers>
      </Document>
    )
  },
  Effect.catchAll((error) => Effect.succeed(<div>Error: {error.message}</div>))
)

export default Layout(_MarathonLayout)
