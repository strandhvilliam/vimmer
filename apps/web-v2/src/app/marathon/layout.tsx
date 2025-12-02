import { getAppSession } from "@/lib/auth/server"
import { Layout } from "@/lib/runtime"
import { Effect, Option } from "effect"
import { redirect } from "next/navigation"
import Document from "@/components/document"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "@/lib/server-utils"
import { TRPCReactProvider } from "@/lib/trpc/react"

const _MarathonLayout = Effect.fn("@blikka/web/MarathonLayout")(function* ({
  children,
}: LayoutProps<"/marathon">) {
  const locale = yield* getLocale()
  const session = yield* getAppSession()

  if (Option.isNone(session)) {
    console.log("redirecting to login")
    redirect("/auth/login")
  }

  return (
    <Document locale={locale}>
      <NextIntlClientProvider>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </NextIntlClientProvider>
    </Document>
  )
})

export default Layout(_MarathonLayout)
