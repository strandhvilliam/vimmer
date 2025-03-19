"use server";
import { z } from "zod";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "../../../../../lib/safe-action";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { deleteTopic, updateTopicsOrder } from "@vimmer/supabase/mutations";
import { getTopicsByDomain } from "@vimmer/supabase/cached-queries";

const deleteTopicSchema = z.object({
  topicId: z.number(),
  marathonId: z.number(),
});

export const deleteTopicAction = actionClient
  .schema(deleteTopicSchema)
  .action(async ({ parsedInput: { topicId, marathonId } }) => {
    const supabase = await createClient();
    const domain = (await cookies()).get("activeDomain")?.value;

    if (!domain) {
      throw new Error("No domain found");
    }

    await deleteTopic(supabase, topicId);

    const allTopics = await getTopicsByDomain(domain);
    const remainingTopics = allTopics?.filter((topic) => topic.id !== topicId);

    if (remainingTopics && remainingTopics.length > 0) {
      const topicIds = remainingTopics
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((topic) => topic.id);
      await updateTopicsOrder(supabase, topicIds, marathonId);
    }
    revalidateTag(`topics-${domain}`);
  });
