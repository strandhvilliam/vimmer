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
