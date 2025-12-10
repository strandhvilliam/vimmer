import { eq } from "drizzle-orm"
import { Effect } from "effect"
import { DrizzleClient } from "../drizzle-client"
import { userMarathons } from "../schema"

export class PermissionsQueries extends Effect.Service<PermissionsQueries>()(
  "@blikka/db/permissions-queries",
  {
    dependencies: [DrizzleClient.Default],
    effect: Effect.gen(function* () {
      const db = yield* DrizzleClient

      const getPermissionsByUserId = Effect.fn("PermissionsQueries.getPermissionsByUserId")(
        function* ({ userId }: { userId: string }) {
          const result = yield* db.query.userMarathons.findMany({
            where: eq(userMarathons.userId, userId),
            with: {
              marathon: true,
            },
          })

          return result.map((rel) => ({
            userId: rel.userId,
            relationId: rel.id,
            marathonId: rel.marathonId,
            domain: rel.marathon.domain,
            role: rel.role,
          }))
        }
      )
      return {
        getPermissionsByUserId,
      } as const
    }),
  }
) {}
