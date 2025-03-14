"use server";
import { z } from "zod";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const updateTopicOrderSchema = z.object({
  topicIds: z.array(z.number()),
  marathonId: z.number(),
});

export const updateTopicOrder = actionClient
  .schema(updateTopicOrderSchema)
  .action(async ({ parsedInput: { topicIds, marathonId } }) => {
    const supabase = await createClient();
    const domain = (await cookies()).get("activeDomain")?.value;

    // Update each topic's order index in a transaction
    const { error } = await supabase.rpc("update_topic_order", {
      p_topic_ids: topicIds,
      p_marathon_id: marathonId,
    });

    if (error) {
      console.error(error);
      throw new Error("Failed to update topic order");
    }
    if (domain) {
      revalidateTag(`topics-${domain}`);
    }
  });

const updateTopicSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  scheduledStart: z.string().nullable(),
  visibility: z.enum(["public", "private"]),
  marathonId: z.number(),
});

export const updateTopic = actionClient
  .schema(updateTopicSchema)
  .action(
    async ({
      parsedInput: { id, name, scheduledStart, visibility, marathonId },
    }) => {
      const supabase = await createClient();
      const domain = (await cookies()).get("activeDomain")?.value;

      const { error } = await supabase
        .from("topics")
        .update({
          name,
          scheduled_start: scheduledStart,
          visibility,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("marathon_id", marathonId)
        .throwOnError();

      if (error) {
        console.error(error);
        throw new Error("Failed to update topic");
      }

      if (domain) {
        revalidateTag(`topics-${domain}`);
      }
    }
  );
