import { Page } from "@/lib/next-utils"
import { Effect } from "effect"
import { ClientPage } from "./client-page"
import { TRPCClient } from "@/lib/trpc/effect-client"
import { cacheLife, cacheTag } from "next/cache"
import { serverRuntime } from "@/lib/runtime"

const _MarathonPage = Effect.fn("@blikka/web/MarathonPage")(
  function* () {
    const trpc = yield* TRPCClient
    const marathons = yield* trpc.query((client) => client.marathons.getAllMarathons.query())

    const something = yield* trpc.query((client) =>
      client.authtest.getSomething.query({ name: "John" })
    )

    return (
      <>
        <ClientPage marathons={marathons} />
      </>
    )
  },
  Effect.catchAll((error) => Effect.succeed(<div>Error: {error.message}</div>))
)

export default Page(_MarathonPage)
