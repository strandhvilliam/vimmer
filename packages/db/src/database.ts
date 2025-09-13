import { Effect } from "effect"
import { UsersQueries } from "./queries/users.queries"
import { ValidationsQueries } from "./queries/validations.queries"
import { SubmissionsQueries } from "./queries/submissions.queries"
import { SponsorsQueries } from "./queries/sponsors.queries"
import { RulesQueries } from "./queries/rules.queries"
import { JuryQueries } from "./queries/jury.queries"
import { MarathonsQueries } from "./queries/marathons.queries"
import { TopicsQueries } from "./queries/topics.queries"
import { DeviceGroupsQueries } from "./queries/device-groups.queries"

export class Database extends Effect.Service<Database>()(
  "@blikka/db/database",
  {
    dependencies: [
      UsersQueries.Default,
      ValidationsQueries.Default,
      SubmissionsQueries.Default,
    ],
    effect: Effect.gen(function* () {
      const usersQueries = yield* UsersQueries
      const validationsQueries = yield* ValidationsQueries
      const submissionsQueries = yield* SubmissionsQueries
      const sponsorsQueries = yield* SponsorsQueries
      const rulesQueries = yield* RulesQueries
      const juryQueries = yield* JuryQueries
      const marathonsQueries = yield* MarathonsQueries
      const topicsQueries = yield* TopicsQueries
      const deviceGroupsQueries = yield* DeviceGroupsQueries

      return {
        usersQueries,
        validationsQueries,
        submissionsQueries,
        sponsorsQueries,
        rulesQueries,
        juryQueries,
        marathonsQueries,
        topicsQueries,
        deviceGroupsQueries,
      }
    }),
  }
) {}
