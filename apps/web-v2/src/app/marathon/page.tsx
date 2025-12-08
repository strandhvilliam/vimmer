import { Page } from "@/lib/next-utils"
import { Effect } from "effect"
import { ClientPage } from "./client-page"
import { prefetch, trpc } from "@/lib/trpc/server"
import { Suspense } from "react"

const _MarathonPage = Effect.fn("@blikka/web/MarathonPage")(
  function* () {
    prefetch(trpc.marathons.getAllMarathons.queryOptions())

    return (
      <Suspense fallback={<div>lodain...</div>}>
        <ClientPage />
      </Suspense>
    )
  }
  // Effect.catchAll((error) => Effect.succeed(<div>Error: {error.message}</div>))
)

export default Page(_MarathonPage)
