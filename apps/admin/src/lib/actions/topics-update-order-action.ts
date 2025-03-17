"use server";
import { z } from "zod";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "../safe-action";
import { revalidateTag } from "next/cache";
import { updateTopicsOrder } from "@vimmer/supabase/mutations";
import { cookies } from "next/headers";

const updateTopicOrderSchema = z.object({
  topicIds: z.array(z.number()),
  marathonId: z.number(),
});

export const updateTopicOrderAction = actionClient
  .schema(updateTopicOrderSchema)
  .action(async ({ parsedInput: { topicIds, marathonId } }) => {
    const supabase = await createClient();
    const domain = (await cookies()).get("activeDomain")?.value;
    if (!domain) {
      throw new Error("No domain found");
    }

    await updateTopicsOrder(supabase, topicIds, marathonId);

    revalidateTag(`topics-${domain}`);
  });
