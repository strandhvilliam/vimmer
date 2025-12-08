"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { formatSubdomainUrl } from "@/lib/utils"
import { Marathon } from "@blikka/db"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { LOCALES } from "@/config"
import { updateLocaleAction } from "./actions"
import { useTRPC } from "@/lib/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const ClientPage = () => {
  const trpc = useTRPC()
  const t = useTranslations("MarathonPage")

  const authTest = useSuspenseQuery(trpc.authtest.getSomething.queryOptions({ name: "test" }))

  const { data: marathons } = useSuspenseQuery(trpc.marathons.getAllMarathons.queryOptions())

  return (
    <div className="container mx-auto px-4 py-8">
      <pre>{JSON.stringify(authTest.data, null, 2)}</pre>
      <div className="mb-8">
        <div className="flex flex-row gap-2">
          {LOCALES.map((locale) => (
            <Button key={locale} onClick={() => updateLocaleAction({ locale })}>
              {locale}
            </Button>
          ))}
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("selectMarathon")}</h1>
        <p className="text-muted-foreground">{t("chooseMarathonDomain")}</p>
      </div>
      {marathons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noMarathonsAvailable")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marathons.map((marathon) => (
            <Card key={marathon.id} className="flex flex-col hover:shadow-lg transition-shadow">
              {marathon.logoUrl && (
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                  <Image src={marathon.logoUrl} alt={marathon.name} fill className="object-cover" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{marathon.name}</CardTitle>
                <CardDescription>
                  {t("domain")}: <span className="font-mono">{marathon.domain}</span>
                </CardDescription>
              </CardHeader>
              {marathon.description && (
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {marathon.description}
                  </p>
                </CardContent>
              )}
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={formatSubdomainUrl(marathon.domain)}>{t("selectDomain")}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
