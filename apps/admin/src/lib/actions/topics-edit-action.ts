"use server";
import { createClient } from "@vimmer/supabase/server";
import { actionClient } from "../safe-action";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

const editTopicSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  scheduledStart: z.string().nullable(),
  visibility: z.enum(["public", "private", "scheduled"]),
  marathonId: z.number(),
});

export const editTopicAction = actionClient
  .schema(editTopicSchema)
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
