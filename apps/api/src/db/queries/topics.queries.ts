import type { Database } from "@vimmer/api/db";
import { marathons, topics, submissions } from "@vimmer/api/db/schema";
import { eq, sql, count } from "drizzle-orm";
import type { NewTopic } from "@vimmer/api/db/types";
import type { SupabaseClient } from "@vimmer/supabase/types";
import { TRPCError } from "@trpc/server";

export async function getTopicsByMarathonIdQuery(
  db: Database,
  { id }: { id: number }
) {
  const result = await db.query.topics.findMany({
    where: eq(topics.marathonId, id),
  });
  return result;
}

export async function getTopicsByDomainQuery(
  db: Database,
  { domain }: { domain: string }
) {
  const result = await db.query.marathons.findMany({
    where: eq(marathons.domain, domain),
    with: {
      topics: true,
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

export async function updateTopic(
  db: Database,
  {
    id,
    data,
  }: {
    id: number;
    data: Partial<NewTopic>;
  }
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
  }
) {
  await supabase
    .rpc("update_topic_order", {
      p_topic_ids: topicIds,
      p_marathon_id: marathonId,
    })
    .throwOnError();
}

export async function createTopic(db: Database, { data }: { data: NewTopic }) {
  const result = await db.insert(topics).values(data).returning({
    id: topics.id,
  });
  return { id: result[0]?.id ?? null };
}

export async function deleteTopic(
  db: Database,
  supabase: SupabaseClient,
  { id, marathonId }: { id: number; marathonId: number }
) {
  const allTopics = await getTopicsByMarathonIdQuery(db, { id: marathonId });

  if (!allTopics.find((topic) => topic.id === id)) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Topic not found",
    });
  }

  const result = await db.delete(topics).where(eq(topics.id, id)).returning({
    id: topics.id,
  });

  const remainingTopics = allTopics.filter((topic) => topic.id !== id);

  if (remainingTopics && remainingTopics.length > 0) {
    const topicIds = remainingTopics
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((topic) => topic.id);

    await updateTopicsOrder(supabase, { topicIds, marathonId });
  }

  return { id: result[0]?.id ?? null };
}

export async function getTopicsWithSubmissionCountQuery(
  db: Database,
  { domain }: { domain: string }
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
  { marathonId }: { marathonId: number }
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
