import "server-only";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

import { createClient } from "./clients/lambda";
import {
  getCompetitionClassesByDomainQuery,
  getDeviceGroupsByDomainQuery,
  getMarathonByDomainQuery,
  getMarathonsByUserIdQuery,
  getMarathonWithConfigByDomainQuery,
  getParticipantByReferenceQuery,
  getParticipantsByDomainQuery,
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

export async function getCompetitionClassesByDomain(domain: string) {
  "use cache";
  cacheTag(`competition-classes-${domain}`);
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getCompetitionClassesByDomainQuery(supabase, domain);
  return data;
}

export async function getDeviceGroupsByDomain(domain: string) {
  "use cache";
  cacheTag(`device-groups-${domain}`);
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getDeviceGroupsByDomainQuery(supabase, domain);
  return data;
}

export async function getParticipantsByDomain(domain: string) {
  "use cache";
  cacheTag(`participants-${domain}`);
  cacheLife("minutes");
  const supabase = await createClient();
  const data = await getParticipantsByDomainQuery(supabase, domain);
  return data;
}

export async function getParticipantByReference(
  domain: string,
  reference: string
) {
  "use cache";
  cacheTag(`participant-${domain}-${reference}`);
  cacheLife("minutes");
  const supabase = await createClient();
  const data = await getParticipantByReferenceQuery(supabase, {
    domain,
    reference,
  });
  return data;
}
