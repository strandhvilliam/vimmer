"use client"

import { TRPCReactProvider } from "@/lib/trpc/client"
import { NextIntlClientProvider } from "next-intl"

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode
  locale: string
  messages: Record<string, unknown>
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </NextIntlClientProvider>
  )
}
