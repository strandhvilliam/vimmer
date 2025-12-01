import { getAppSession } from "@/lib/auth/server"
import { Layout } from "@/lib/runtime"
import { Effect, Option } from "effect"
import { redirect } from "next/navigation"
import Document from "@/components/document"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "@/lib/server-utils"
const _MarathonLayout = Effect.fn("@blikka/web/MarathonLayout")(function* ({
  children,
}: LayoutProps<"/marathon">) {
  const locale = yield* getLocale()
  const session = yield* getAppSession()

  if (Option.isNone(session)) {
    redirect("/auth/login")
  }

  return (
    <Document locale={locale}>
      <NextIntlClientProvider>{children}</NextIntlClientProvider>
    </Document>
  )
})

export default Layout(_MarathonLayout)
