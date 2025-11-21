import { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"
import { ReactNode } from "react"
import Document from "@/components/document"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { LOCALE_COOKIE_NAME } from "@/config"

type Props = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: "next-intl-mixed-routing (app)",
}

export default async function LocaleLayout({ children }: Props) {
  const locale = await getLocale()

  async function updateLocaleAction(data: FormData) {
    "use server"

    const store = await cookies()
    store.set(LOCALE_COOKIE_NAME, data.get("locale") as string)

    revalidatePath("/marathon")
  }

  return (
    <Document locale={locale}>
      <NextIntlClientProvider>
        <div className="flex">
          <div className="flex min-h-screen w-[270px] shrink-0 flex-col justify-between p-8">
            <div className="flex items-center justify-between">
              <form action={updateLocaleAction} className="flex gap-3">
                <button
                  className={locale === "en" ? "underline" : undefined}
                  name="locale"
                  type="submit"
                  value="en"
                >
                  English
                </button>
                <button
                  className={locale === "sv" ? "underline" : undefined}
                  name="locale"
                  type="submit"
                  value="sv"
                >
                  Svenska
                </button>
              </form>
            </div>
          </div>
          <div className="p-8">{children}</div>
        </div>
      </NextIntlClientProvider>
    </Document>
  )
}
