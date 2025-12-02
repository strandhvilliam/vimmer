import { Page } from "@/lib/runtime"
import { Effect } from "effect"
import { Database } from "@blikka/db"
import { ClientPage } from "./client-page"

const _MarathonPage = Effect.fn("@blikka/web/MarathonPage")(
  function* () {
    const db = yield* Database
    const marathons = yield* db.marathonsQueries.getMarathons()

    return (
      <>
        <ClientPage marathons={marathons} />
      </>
    )
  },
  Effect.catchAll((error) => Effect.succeed(<div>Error: {error.message}</div>))
)

export default Page(_MarathonPage)
