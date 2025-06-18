import type { Database, IdResponse } from "@/db";
import { marathons, topics } from "../schema";
import { and, eq } from "drizzle-orm";
import type { NewTopic, Topic } from "../types";
import type { SupabaseClient } from "@vimmer/supabase/types";

export async function getTopicsByMarathonIdQuery(
  db: Database,
  { id }: { id: number }
): Promise<Topic[]> {
  const result = await db.query.topics.findMany({
    where: eq(topics.marathonId, id),
  });
  return result;
}

export async function getTopicsByDomainQuery(
  db: Database,
  { domain }: { domain: string }
): Promise<Topic[]> {
  const result = await db.query.marathons.findMany({
    where: eq(marathons.domain, domain),
    with: {
      topics: true,
    },
  });
  return result.flatMap(({ topics }) => topics);
}

export async function getTopicByIdQuery(
  db: Database,
  { id }: { id: number }
): Promise<Topic | null> {
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
): Promise<IdResponse> {
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

export async function createTopic(
  db: Database,
  { data }: { data: NewTopic }
): Promise<IdResponse> {
  const result = await db.insert(topics).values(data).returning({
    id: topics.id,
  });
  return { id: result[0]?.id ?? null };
}

export async function deleteTopic(
  db: Database,
  { id }: { id: number }
): Promise<IdResponse> {
  const result = await db.delete(topics).where(eq(topics.id, id)).returning({
    id: topics.id,
  });
  return { id: result[0]?.id ?? null };
}
