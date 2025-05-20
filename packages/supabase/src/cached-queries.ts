import "server-only";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import {
  userMarathonsTag,
  topicsByDomainTag,
  marathonByDomainTag,
  competitionClassesByDomainTag,
  deviceGroupsByDomainTag,
  participantsByDomainTag,
  participantByReferenceTag,
  validationResultsByParticipantIdTag,
  rulesByMarathonIdTag,
  topicsWithSubmissionCountTag,
  participantVerificationsByStaffIdTag,
} from "./cache-tags";

import { createClient } from "./clients/lambda";
import {
  getCompetitionClassesByDomainQuery,
  getDeviceGroupsByDomainQuery,
  getMarathonByDomainQuery,
  getMarathonsByUserIdQuery,
  getMarathonWithConfigByDomainQuery,
  getParticipantByIdQuery,
  getParticipantByReferenceQuery,
  getParticipantsByDomainQuery,
  getParticipantVerificationsByStaffIdQuery,
  getRulesByMarathonIdQuery,
  getTopicsByDomainQuery,
  getTopicsWithSubmissionCountQuery,
  getValidationResultsByParticipantIdQuery,
} from "./queries";

export async function getUserMarathons(userId: string) {
  "use cache";
  cacheTag(userMarathonsTag({ userId }));
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getMarathonsByUserIdQuery(supabase, userId);
  return data;
}

export async function getTopicsByDomain(domain: string) {
  "use cache";
  cacheTag(topicsByDomainTag({ domain }));
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getTopicsByDomainQuery(supabase, domain);
  return data;
}

export async function getMarathonByDomain(domain: string) {
  "use cache";
  cacheTag(marathonByDomainTag({ domain }));
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getMarathonByDomainQuery(supabase, domain);
  return data;
}

export async function getCompetitionClassesByDomain(domain: string) {
  "use cache";
  cacheTag(competitionClassesByDomainTag({ domain }));
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getCompetitionClassesByDomainQuery(supabase, domain);
  return data;
}

export async function getDeviceGroupsByDomain(domain: string) {
  "use cache";
  cacheTag(deviceGroupsByDomainTag({ domain }));
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getDeviceGroupsByDomainQuery(supabase, domain);
  return data;
}

export async function getParticipantsByDomain(domain: string) {
  "use cache";
  cacheTag(participantsByDomainTag({ domain }));
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
  cacheTag(participantByReferenceTag({ domain, reference }));
  cacheLife("minutes");
  const supabase = await createClient();
  const data = await getParticipantByReferenceQuery(supabase, {
    domain,
    reference,
  });

  return data;
}

export async function getValidationResultsByParticipantId(
  participantId: number
) {
  "use cache";
  cacheTag(validationResultsByParticipantIdTag({ participantId }));
  cacheLife("minutes");
  const supabase = await createClient();
  const data = await getValidationResultsByParticipantIdQuery(
    supabase,
    participantId
  );
  return data;
}

export async function getRulesByMarathonId(marathonId: number) {
  "use cache";
  cacheTag(rulesByMarathonIdTag({ marathonId }));
  cacheLife("hours");
  const supabase = await createClient();
  const data = await getRulesByMarathonIdQuery(supabase, marathonId);
  return data;
}

export async function getTopicsWithSubmissionCount(marathonId: number) {
  "use cache";
  cacheTag(topicsWithSubmissionCountTag({ marathonId }));
  cacheLife("seconds");
  const supabase = await createClient();
  const data = await getTopicsWithSubmissionCountQuery(supabase, marathonId);
  return data;
}

export async function getParticipantVerificationsByStaffId(staffId: string) {
  "use cache";
  cacheTag(participantVerificationsByStaffIdTag({ staffId }));
  cacheLife("minutes");
  const supabase = await createClient();
  const data = await getParticipantVerificationsByStaffIdQuery(
    supabase,
    staffId
  );
  return data;
}
