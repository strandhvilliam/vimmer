import { Page } from "@/lib/runtime"
import { Effect } from "effect"
import Link from "next/link"

const availableDomains = ["uppis"]

const _MarathonPage = Effect.fn("@blikka/web/MarathonPage")(function* () {
  return (
    <div>
      <h1>Marathon</h1>
      <p>
        Available domains:{" "}
        {availableDomains
          .map((domain) => (
            <Link key={domain} href={`/marathon/${domain}`}>
              {domain}
            </Link>
          ))
          .join(", ")}
      </p>
    </div>
  )
})

export default Page(_MarathonPage)
