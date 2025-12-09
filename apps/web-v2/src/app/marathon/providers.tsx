"use client"

import { TRPCReactProvider } from "@/lib/trpc/react"
import { NextIntlClientProvider } from "next-intl"

export function Providers({
  children,
  locale,
  messages,
  sessionToken,
}: {
  children: React.ReactNode
  locale: string
  messages: Record<string, unknown>
  sessionToken: string
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TRPCReactProvider sessionToken={sessionToken}>{children}</TRPCReactProvider>
    </NextIntlClientProvider>
  )
}
