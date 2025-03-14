import "server-only";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

import { createClient } from "./clients/lambda";
import {
  getMarathonByDomainQuery,
  getMarathonsByUserIdQuery,
  getMarathonWithConfigByDomainQuery,
  getTopicsByDomainQuery,
} from "./queries";

// export async function getMarathonWithConfigByDomain(domain: string) {
//   "use cache";
//   cacheTag(`marathon-${domain}`);
//   cacheLife("minutes");
//   const supabase = await createClient();
//   const data = await getMarathonWithConfigByDomainQuery(supabase, domain);
//   return data;
// }

export async function getUserMarathons(userId: string) {
  "use cache";
  cacheTag(`user-marathons-${userId}`);
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getMarathonsByUserIdQuery(supabase, userId);
  return data;
}

export async function getTopicsByDomain(domain: string) {
  "use cache";
  cacheTag(`topics-${domain}`);
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getTopicsByDomainQuery(supabase, domain);
  return data;
}

export async function getMarathonByDomain(domain: string) {
  "use cache";
  cacheTag(`marathon-${domain}`);
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getMarathonByDomainQuery(supabase, domain);
  return data;
}
