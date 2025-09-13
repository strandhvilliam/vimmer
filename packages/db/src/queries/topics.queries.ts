import { Effect } from "effect"
import { DrizzleClient } from "../drizzle-client"
import { marathons, submissions } from "../schema"
import { count, eq } from "drizzle-orm"
import { topics } from "../schema"
import type { NewTopic } from "../types"
import { SqlError } from "@effect/sql/SqlError"
import { SupabaseClient } from "../supabase-client"

export class TopicsQueries extends Effect.Service<TopicsQueries>()(
  "@blikka/db/topics-queries",
  {
    dependencies: [DrizzleClient.Default, SupabaseClient.Default],
    effect: Effect.gen(function* () {
      const db = yield* DrizzleClient
      const supabase = yield* SupabaseClient

      const getTopicsByMarathonIdQuery = Effect.fn(
        "TopicsQueries.getTopicsByMarathonIdQuery"
      )(function* ({ id }: { id: number }) {
        const result = yield* db.query.topics.findMany({
          where: eq(topics.marathonId, id),
          orderBy: (topics, { asc }) => [asc(topics.orderIndex)],
        })
        return result
      })

      const getTopicsByDomainQuery = Effect.fn(
        "TopicsQueries.getTopicsByDomainQuery"
      )(function* ({ domain }: { domain: string }) {
        const result = yield* db.query.marathons.findMany({
          where: eq(marathons.domain, domain),
          with: {
            topics: true,
          },
        })
        console.log("result", result)
        return result.flatMap(({ topics }) => topics)
      })

      const getTopicByIdQuery = Effect.fn("TopicsQueries.getTopicByIdQuery")(
        function* ({ id }: { id: number }) {
          const result = yield* db.query.topics.findFirst({
            where: eq(topics.id, id),
          })
          return result ?? null
        }
      )

      const updateTopicQuery = Effect.fn("TopicsQueries.updateTopicQuery")(
        function* ({ id, data }: { id: number; data: Partial<NewTopic> }) {
          const [result] = yield* db
            .update(topics)
            .set(data)
            .where(eq(topics.id, id))
            .returning()

          if (!result) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Failed to update topic",
              })
            )
          }

          return result
        }
      )

      const updateTopicsOrder = Effect.fn("TopicsQueries.updateTopicsOrder")(
        function* ({
          topicIds,
          marathonId,
        }: {
          topicIds: number[]
          marathonId: number
        }) {
          yield* supabase.use((client) =>
            client
              .rpc("update_topic_order", {
                p_topic_ids: topicIds,
                p_marathon_id: marathonId,
              })
              .throwOnError()
          )
        }
      )

      const createTopicQuery = Effect.fn("TopicQueries.createTopicQuery")(
        function* ({ data }: { data: NewTopic }) {
          const [result] = yield* db.insert(topics).values(data).returning({
            id: topics.id,
          })

          if (!result) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Failed to create topic",
              })
            )
          }

          return result
        }
      )

      const deleteTopicQuery = Effect.fn("TopicQueries.deleteTopicQuery")(
        function* ({ id }: { id: number }) {
          const [result] = yield* db
            .delete(topics)
            .where(eq(topics.id, id))
            .returning()
          if (!result) {
            return yield* Effect.fail(
              new SqlError({
                cause: "Failed to delete topic",
              })
            )
          }
          return result
        }
      )

      const getTopicsWithSubmissionCountQuery = Effect.fn(
        "TopicQueries.getTopicsWithSubmissionCountQuery"
      )(function* ({ domain }: { domain: string }) {
        const data = yield* db
          .select({
            id: topics.id,
            count: count(submissions.id),
          })
          .from(topics)
          .innerJoin(marathons, eq(topics.marathonId, marathons.id))
          .leftJoin(submissions, eq(topics.id, submissions.topicId))
          .where(eq(marathons.domain, domain))
          .groupBy(topics.id)
        return data
      })

      const getTotalSubmissionCountQuery = Effect.fn(
        "TopicQueries.getTotalSubmissionCountQuery"
      )(function* ({ marathonId }: { marathonId: number }) {
        const [result] = yield* db
          .select({ count: count(submissions.id) })
          .from(submissions)
          .where(eq(submissions.marathonId, marathonId))

        return result?.count ?? 0
      })

      const getScheduledTopicsQuery = Effect.fn(
        "TopicQueries.getScheduledTopicsQuery"
      )(function* () {
        const [result] = yield* db.query.topics.findMany({
          where: eq(topics.visibility, "scheduled"),
          with: {
            marathon: true,
          },
        })
        return result
      })

      return {
        getTopicsByMarathonIdQuery,
        getTopicsByDomainQuery,
        getTopicByIdQuery,
        updateTopicQuery,
        updateTopicsOrder,
        createTopicQuery,
        deleteTopicQuery,
        getTopicsWithSubmissionCountQuery,
        getTotalSubmissionCountQuery,
        getScheduledTopicsQuery,
      }
    }),
  }
) {}
