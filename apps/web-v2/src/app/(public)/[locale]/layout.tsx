import { Metadata } from "next"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import Document from "@/components/document"
import { locales } from "@/config"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: "next-intl-mixed-routing (public)",
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  // Ensure that the incoming locale is valid
  const { locale } = await params
  console.log("locale", locale)
  if (!hasLocale(locales, locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  return (
    <Document locale={locale}>
      <NextIntlClientProvider>
        <div className="m-auto max-w-240 p-4">
          <div className="-mx-4 min-h-[200px] bg-slate-100 p-4">{children}</div>
        </div>
      </NextIntlClientProvider>
    </Document>
  )
}
