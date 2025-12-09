"use client"

import Link from "next/link"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { LOCALES } from "@/config"
import { updateLocaleAction } from "./actions"
import { useTRPC } from "@/lib/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { formatSubdomainUrl } from "@/lib/utils"

export const ClientPage = () => {
  const trpc = useTRPC()
  const t = useTranslations("MarathonPage")

  const { data: marathons } = useSuspenseQuery(trpc.marathons.getUserMarathons.queryOptions())

  if (marathons.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">{t("noMarathonsAvailable")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-row gap-2 mb-4">
        {LOCALES.map((locale) => (
          <Button key={locale} onClick={() => updateLocaleAction({ locale })}>
            {locale}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full">
        {marathons.map((marathon) => (
          <Card key={marathon.id} className="flex flex-row items-center p-4 w-full">
            <div className="flex flex-col w-full">
              <CardTitle className="text-lg">{marathon.name}</CardTitle>
              <CardDescription>Stockholm | {marathon.domain}</CardDescription>
            </div>
            <Button asChild className="ml-auto">
              <Link href={formatSubdomainUrl(marathon.domain)}>{t("selectDomain")}</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
