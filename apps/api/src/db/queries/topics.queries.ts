import type { Database } from "@vimmer/api/db";
import { marathons, topics, submissions } from "@vimmer/api/db/schema";
import { eq, sql, count } from "drizzle-orm";
import type { NewTopic } from "@vimmer/api/db/types";
import type { SupabaseClient } from "@vimmer/supabase/types";

export async function getTopicsByMarathonIdQuery(
  db: Database,
  { id }: { id: number },
) {
  const result = await db.query.topics.findMany({
    where: eq(topics.marathonId, id),
    orderBy: (topics, { asc }) => [asc(topics.orderIndex)],
  });
  return result;
}

export async function getTopicsByDomainQuery(
  db: Database,
  { domain }: { domain: string },
) {
  const result = await db.query.marathons.findMany({
    where: eq(marathons.domain, domain),
    with: {
      topics: {
        orderBy: (topics, { asc }) => [asc(topics.orderIndex)],
      },
    },
  });
  return result.flatMap(({ topics }) => topics);
}

export async function getTopicByIdQuery(db: Database, { id }: { id: number }) {
  const result = await db.query.topics.findFirst({
    where: eq(topics.id, id),
  });
  return result ?? null;
}

export async function updateTopicQuery(
  db: Database,
  {
    id,
    data,
  }: {
    id: number;
    data: Partial<NewTopic>;
  },
) {
  const result = await db
    .update(topics)
    .set(data)
    .where(eq(topics.id, id))
    .returning({
      id: topics.id,
    });
  return { id: result[0]?.id ?? null };
}

export async function updateTopicsOrder(
  supabase: SupabaseClient,
  {
    topicIds,
    marathonId,
  }: {
    topicIds: number[];
    marathonId: number;
  },
) {
  await supabase
    .rpc("update_topic_order", {
      p_topic_ids: topicIds,
      p_marathon_id: marathonId,
    })
    .throwOnError();
}

export async function createTopicQuery(
  db: Database,
  { data }: { data: NewTopic },
) {
  const result = await db.insert(topics).values(data).returning({
    id: topics.id,
  });
  return { id: result[0]?.id ?? null };
}

export async function deleteTopicQuery(db: Database, { id }: { id: number }) {
  const result = await db.delete(topics).where(eq(topics.id, id)).returning({
    id: topics.id,
  });
  return { id: result[0]?.id ?? null };
}

export async function getTopicsWithSubmissionCountQuery(
  db: Database,
  { domain }: { domain: string },
): Promise<{ id: number; count: number }[]> {
  const data = await db
    .select({
      id: topics.id,
      count: count(submissions.id),
    })
    .from(topics)
    .innerJoin(marathons, eq(topics.marathonId, marathons.id))
    .leftJoin(submissions, eq(topics.id, submissions.topicId))
    .where(eq(marathons.domain, domain))
    .groupBy(topics.id);
  return data;
}

export async function getTotalSubmissionCountQuery(
  db: Database,
  { marathonId }: { marathonId: number },
) {
  const result = await db
    .select({ count: count(submissions.id) })
    .from(submissions)
    .where(eq(submissions.marathonId, marathonId));

  return result[0]?.count ?? 0;
}

export async function getScheduledTopicsQuery(db: Database) {
  const result = await db.query.topics.findMany({
    where: eq(topics.visibility, "scheduled"),
    with: {
      marathon: true,
    },
  });

  return result;
}
