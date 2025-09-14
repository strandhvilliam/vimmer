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
import { CompetitionClassesQueries } from "./queries/competition-classes.queries"
import { ParticipantsQueries } from "./queries/participants.queries"

export class Database extends Effect.Service<Database>()(
  "@blikka/db/database",
  {
    dependencies: [
      UsersQueries.Default,
      ValidationsQueries.Default,
      SubmissionsQueries.Default,
      SponsorsQueries.Default,
      RulesQueries.Default,
      JuryQueries.Default,
      MarathonsQueries.Default,
      TopicsQueries.Default,
      DeviceGroupsQueries.Default,
      CompetitionClassesQueries.Default,
      ParticipantsQueries.Default,
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
      const competitionClassesQueries = yield* CompetitionClassesQueries
      const participantsQueries = yield* ParticipantsQueries

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
        competitionClassesQueries,
        participantsQueries,
      }
    }),
  }
) {}
