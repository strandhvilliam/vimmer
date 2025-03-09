import "server-only";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

import { createClient } from "./clients/lambda";
import {
  getMarathonsByUserIdQuery,
  getMarathonWithConfigByDomainQuery,
} from "./queries";

export async function getMarathonWithConfigByDomain(domain: string) {
  "use cache";
  cacheTag(`marathon-with-config-${domain}`);
  cacheLife("minutes");
  const supabase = await createClient();
  const data = await getMarathonWithConfigByDomainQuery(supabase, domain);
  return data;
}

export async function getUserMarathons(userId: string) {
  "use cache";
  cacheTag(`user-marathons-${userId}`);
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getMarathonsByUserIdQuery(supabase, userId);
  return data;
}
