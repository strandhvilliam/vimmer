import { Page } from "@/lib/runtime"
import { Effect } from "effect"
import Link from "next/link"
import { Database } from "@blikka/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { formatSubdomainUrl } from "@/lib/utils"

const _MarathonPage = Effect.fn("@blikka/web/MarathonPage")(
  function* () {
    const db = yield* Database
    const marathons = yield* db.marathonsQueries.getMarathons()

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Select a Marathon</h1>
          <p className="text-muted-foreground">Choose a marathon domain to continue</p>
        </div>

        {marathons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No marathons available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marathons.map((marathon) => (
              <Card key={marathon.id} className="flex flex-col hover:shadow-lg transition-shadow">
                {marathon.logoUrl && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={marathon.logoUrl}
                      alt={marathon.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{marathon.name}</CardTitle>
                  <CardDescription>
                    Domain: <span className="font-mono">{marathon.domain}</span>
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
                    <Link href={formatSubdomainUrl(marathon.domain)}>Select Domain</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  },
  Effect.catchAll((error) => Effect.succeed(<div>Error: {error.message}</div>))
)

export default Page(_MarathonPage)
