import { Handler } from "aws-lambda";
import { createClient } from "@vimmer/supabase/lambda";
import { getScheduledTopicsQuery } from "@vimmer/supabase/queries";
import { updateTopic } from "@vimmer/supabase/mutations";
import { Resource } from "sst";

const ADMIN_APP_URL = Resource.AdminApp.url;
const ADMIN_APP_REVALIDATE_PATH = "/api/revalidate";

export const handler: Handler = async (event): Promise<void> => {
  const supabase = await createClient();
  const scheduledTopics = await getScheduledTopicsQuery(supabase);

  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    throw new Error("REVALIDATE_SECRET is not set");
  }

  const topicsToUpdate = scheduledTopics.filter((topic) => {
    const now = new Date();
    const scheduledStart = topic.scheduledStart
      ? new Date(topic.scheduledStart)
      : null;
    return scheduledStart && scheduledStart < now;
  });

  if (topicsToUpdate.length === 0) {
    return;
  }

  const marathonDomains = topicsToUpdate.map((topic) => topic.marathon.domain);
  const revalidateUrl = new URL(ADMIN_APP_REVALIDATE_PATH, ADMIN_APP_URL);
  revalidateUrl.searchParams.set("type", "topics");
  revalidateUrl.searchParams.set("domains", marathonDomains.join(","));
  revalidateUrl.searchParams.set("secret", secret);

  try {
    await Promise.all(
      topicsToUpdate.map((topic) => {
        return updateTopic(supabase, topic.id, {
          visibility: "public",
        });
      })
    );

    await fetch(revalidateUrl.toString(), {
      method: "POST",
    });
  } catch (error) {
    console.error(error);
  }
};
