import { PubSubLoggerLayer } from "@blikka/pubsub"
import { createEffectWebHandler, parseSearchParams } from "app/lib/utils"
import { Effect, Layer, Option, Schema, pipe } from "effect"
import { Database } from "@blikka/db"
import { HttpServerRequest, HttpServerResponse } from "@effect/platform"

const QuerySchema = Schema.Struct({
  domain: Schema.optional(Schema.String),
})

const effectHandler = Effect.gen(function* () {
  const db = yield* Database
  const query = yield* parseSearchParams(yield* HttpServerRequest.HttpServerRequest, QuerySchema)

  // Get all marathons (simplified - just domain and name)
  const allMarathons = yield* db.marathonsQueries.getMarathons()
  const marathons = allMarathons.map((m) => ({
    domain: m.domain,
    name: m.name,
  }))

  let competitionClasses: Array<{ id: number; name: string }> = []
  let deviceGroups: Array<{ id: number; name: string }> = []

  // If domain is provided, get competition classes and device groups
  if (query.domain) {
    const competitionClassesResult =
      yield* db.competitionClassesQueries.getCompetitionClassesByDomain({ domain: query.domain })
    competitionClasses = competitionClassesResult.map((cc) => ({
      id: cc.id,
      name: cc.name,
    }))

    const deviceGroupsResult = yield* db.deviceGroupsQueries.getDeviceGroupsByDomain({
      domain: query.domain,
    })
    deviceGroups = deviceGroupsResult.map((dg) => ({
      id: dg.id,
      name: dg.name,
    }))
  }

  return yield* HttpServerResponse.json({
    marathons,
    competitionClasses,
    deviceGroups,
  })
}).pipe(Effect.catchAll(() => HttpServerResponse.empty({ status: 500 })))

const mainLive = Layer.mergeAll(PubSubLoggerLayer, Database.Default)
const handler = await createEffectWebHandler(mainLive, effectHandler)

export const GET = handler
