import { getAppSession } from "@/lib/auth/server"
import { Layout } from "@/lib/next-utils"
import { Effect, Option } from "effect"
import { redirect } from "next/navigation"
import Document from "@/components/document"
import { getHeaders, getLocale } from "@/lib/server-utils"
import { Providers } from "./providers"

import { getI18nMessages } from "@/i18n/utils"
import { Toaster } from "sonner"
import { DotPattern } from "@/components/dot-pattern"

const _MarathonLayout = Effect.fn("@blikka/web/MarathonLayout")(
  function* ({ children }: LayoutProps<"/marathon">) {
    const [locale, session, headersStore, messages] = yield* Effect.all([
      getLocale(),
      getAppSession(),
      getHeaders(),
      getI18nMessages(),
    ])

    if (Option.isNone(session)) {
      console.log("redirecting to login")
      redirect("/auth/login")
    }

    return (
      <Document locale={locale}>
        <Providers locale={locale} messages={messages}>
          <DotPattern />
          <Toaster />

          {children}
        </Providers>
      </Document>
    )
  },
  Effect.catchAll((error) => Effect.succeed(<div>Error: {error.message}</div>))
)

export default Layout(_MarathonLayout)
