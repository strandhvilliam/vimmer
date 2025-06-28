import type { Database } from "@api/db";
import { marathons, topics } from "../schema";
import { eq } from "drizzle-orm";
import type { NewTopic } from "../types";
import type { SupabaseClient } from "@vimmer/supabase/types";

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

export async function deleteTopic(db: Database, { id }: { id: number }) {
  const result = await db.delete(topics).where(eq(topics.id, id)).returning({
    id: topics.id,
  });
  return { id: result[0]?.id ?? null };
}

export async function getTopicsWithSubmissionCountQuery(
  supabase: SupabaseClient,
  { marathonId }: { marathonId: number }
) {
  const { data } = await supabase
    .from("topics")
    .select("id, submissions:submissions(count)", {
      count: "exact",
    })
    .eq("marathon_id", marathonId)
    .throwOnError();

  return (
    data?.map((topic: any) => ({
      id: topic.id,
      submissions: topic.submissions,
    })) ?? []
  );
}

export async function getTotalSubmissionCountQuery(
  supabase: SupabaseClient,
  { marathonId }: { marathonId: number }
) {
  const { count } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("marathon_id", marathonId)
    .throwOnError();

  return count ?? 0;
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
