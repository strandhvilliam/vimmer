"use server";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "@/lib/actions/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { getTopicsByDomain } from "@vimmer/supabase/cached-queries";
import {
  createTopic,
  deleteTopic,
  updateTopicsOrder,
} from "@vimmer/supabase/mutations";

const createTopicSchema = z.object({
  marathonId: z.number(),
  name: z.string().min(1),
  scheduledStart: z.string().nullable(),
  visibility: z.enum(["public", "private", "scheduled"]),
  orderIndex: z.number().optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export const createTopicAction = actionClient
  .schema(createTopicSchema)
  .action(
    async ({
      parsedInput: { marathonId, name, scheduledStart, visibility, orderIndex },
    }) => {
      const domain = (await cookies()).get("activeDomain")?.value;
      if (!domain) {
        throw new Error("No domain found");
      }

      const supabase = await createClient();
      const createdTopic = await createTopic(supabase, {
        marathonId,
        name,
        scheduledStart,
        visibility,
        orderIndex: -1,
      });

      const existingTopics = await getTopicsByDomain(domain);

      const finalOrderIndex =
        !orderIndex || orderIndex === -1
          ? existingTopics?.length || 0
          : orderIndex;

      let newOrdering = [];
      try {
        // Always reorder if we have existing topics, regardless of position
        if (existingTopics && existingTopics.length > 0) {
          // If placing at the end, just append to existing order
          if (finalOrderIndex >= existingTopics.length) {
            newOrdering = [
              ...existingTopics.map((topic) => topic.id),
              createdTopic.id,
            ];
          } else {
            // Insert at specific position
            for (let i = 0; i < existingTopics.length; i++) {
              if (i === finalOrderIndex) {
                newOrdering.push(createdTopic.id);
              }
              const topic = existingTopics.find(
                (topic) => topic.orderIndex === i
              );
              if (topic) {
                newOrdering.push(topic.id);
              }
            }
          }
          await updateTopicsOrder(supabase, newOrdering, marathonId);
        }
      } catch (error) {
        // If the order update fails, delete the created topic
        await deleteTopic(supabase, createdTopic.id);
        throw error;
      }

      revalidateTag(`topics-${domain}`);
      return { ...createdTopic, orderIndex: finalOrderIndex };
    }
  );
