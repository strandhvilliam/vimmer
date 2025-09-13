import { Config, Effect } from "effect"
import { PgClient } from "@effect/sql-pg"
import * as PgDrizzle from "@effect/sql-drizzle/Pg"
import * as schema from "./schema"

const PgLive = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
})

export class DrizzleClient extends Effect.Service<DrizzleClient>()(
  "@blikka/db/drizzle-client",
  {
    dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const db = yield* PgDrizzle.make<typeof schema>({
        schema,
      })
      return db
    }),
  }
) {}
