import { Config, Effect } from "effect"
import { PgClient } from "@effect/sql-pg"
import * as PgDrizzle from "@effect/sql-drizzle/Pg"
import * as schema from "./schema"

const PgLive = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
  // password: Config.redacted("DEV_DATABASE_PASSWORD"),
  // username: Config.string("DEV_DATABASE_USERNAME"),
  // host: Config.string("DEV_DATABASE_HOST"),
  // port: Config.number("DEV_DATABASE_PORT"),
  // database: Config.string("DEV_DATABASE_NAME"),
})

export class DrizzleClient extends Effect.Service<DrizzleClient>()("@blikka/db/drizzle-client", {
  dependencies: [PgLive],
  effect: Effect.gen(function* () {
    console.log("db")
    const db = yield* PgDrizzle.make<typeof schema>({
      schema,
    })
    return db
  }),
}) {}
