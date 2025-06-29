"use server";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "@/lib/actions/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { updateTopic } from "@vimmer/supabase/mutations";

const editTopicSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  scheduledStart: z.string().nullable(),
  visibility: z.enum(["public", "private", "scheduled"]),
});

export type EditTopicInput = z.infer<typeof editTopicSchema>;

export const editTopicAction = actionClient
  .schema(editTopicSchema)
  .action(async ({ parsedInput: { id, name, scheduledStart, visibility } }) => {
    const supabase = await createClient();
    const domain = (await cookies()).get("activeDomain")?.value;

    if (!domain) {
      throw new Error("No domain found");
    }

    const updatedTopic = await updateTopic(supabase, id, {
      name,
      scheduledStart,
      visibility,
    });

    revalidateTag(`topics-${domain}`);
    return updatedTopic;
  });
