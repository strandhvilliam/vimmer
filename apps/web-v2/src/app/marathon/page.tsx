import { Page } from "@/lib/runtime"
import { Effect } from "effect"
import { ClientPage } from "./client-page"
import { TRPCClient } from "@/lib/trpc/effect-client"

const _MarathonPage = Effect.fn("@blikka/web/MarathonPage")(
  function* () {
    const trpc = yield* TRPCClient
    const marathons = yield* trpc.query((client) => client.marathons.getAllMarathons.query())

    return (
      <>
        <ClientPage marathons={marathons} />
      </>
    )
  },
  Effect.catchAll((error) => Effect.succeed(<div>Error: {error.message}</div>))
)

export default Page(_MarathonPage)
