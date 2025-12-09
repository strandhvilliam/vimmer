import { Page } from "@/lib/next-utils"
import { Effect } from "effect"
import { prefetch, trpc } from "@/lib/trpc/server"
import { Suspense } from "react"
import { SelectDomainTitle } from "./_components/select-domain-title"
import { SelectDomainSkeleton } from "./_components/select-domain-skeleton"
import { ClientPage } from "./client-page"

const _MarathonPage = Effect.fn("@blikka/web/MarathonPage")(function* () {
  prefetch(trpc.marathons.getUserMarathons.queryOptions())

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden flex-col gap-4">
      <SelectDomainTitle />
      <div className="w-full max-w-md relative z-10 mt-4 min-h-[500px]">
        <Suspense fallback={<SelectDomainSkeleton />}>
          <ClientPage />
        </Suspense>
      </div>
    </div>
  )
})

export default Page(_MarathonPage)
