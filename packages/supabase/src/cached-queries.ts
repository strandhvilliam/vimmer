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
  zippedSubmissionsByMarathonIdTag,
  juryInvitationByIdTag,
  juryInvitationsByDomainTag,
  staffMembersByDomainTag,
  staffMemberByIdTag,
  rulesByDomainTag,
} from "./cache-tags";

import { createClient } from "./clients/lambda";
import {
  getCompetitionClassesByDomainQuery,
  getDeviceGroupsByDomainQuery,
  getJuryInvitationByIdQuery,
  getMarathonByDomainQuery,
  getMarathonsByUserIdQuery,
  getParticipantByReferenceQuery,
  getParticipantsByDomainQuery,
  getParticipantVerificationsByStaffIdQuery,
  getRulesByMarathonIdQuery,
  getTopicsByDomainQuery,
  getTopicsWithSubmissionCountQuery,
  getValidationResultsByParticipantIdQuery,
  getZippedSubmissionsByDomainQuery,
  getSubmissionsForJuryQuery,
  getJuryInvitationsByMarathonIdQuery,
  getStaffMembersByDomainQuery,
  getStaffMemberByIdQuery,
  getRulesByDomainQuery,
} from "./queries";
import {
  CompetitionClass,
  DeviceGroup,
  JuryInvitation,
  Participant,
  Submission,
  User,
  UserMarathonRelation,
  ValidationResult,
  Topic,
} from "./types";

export async function getUserMarathons(userId: string) {
  // "use cache";
  // cacheTag(userMarathonsTag({ userId }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getMarathonsByUserIdQuery(supabase, userId);
  return data;
}

export async function getTopicsByDomain(domain: string) {
  // "use cache";
  // cacheTag(topicsByDomainTag({ domain }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getTopicsByDomainQuery(supabase, domain);
  return data;
}

export async function getMarathonByDomain(domain: string) {
  // "use cache";
  // cacheTag(marathonByDomainTag({ domain }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getMarathonByDomainQuery(supabase, domain);
  return data;
}

export async function getCompetitionClassesByDomain(
  domain: string,
): Promise<CompetitionClass[]> {
  // "use cache";
  // cacheTag(competitionClassesByDomainTag({ domain }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getCompetitionClassesByDomainQuery(supabase, domain);
  return data;
}

export async function getDeviceGroupsByDomain(
  domain: string,
): Promise<DeviceGroup[]> {
  // "use cache";
  // cacheTag(deviceGroupsByDomainTag({ domain }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getDeviceGroupsByDomainQuery(supabase, domain);
  return data;
}

export async function getParticipantsByDomain(domain: string): Promise<
  (Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
    validationResults: ValidationResult[];
  })[]
> {
  // "use cache";
  // cacheTag(participantsByDomainTag({ domain }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getParticipantsByDomainQuery(supabase, domain);
  return data;
}

export async function getParticipantByReference(
  domain: string,
  reference: string,
): Promise<
  | (Participant & {
      submissions: Submission[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
      validationResults: ValidationResult[];
    })
  | null
> {
  // "use cache";
  // cacheTag(participantByReferenceTag({ domain, reference }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getParticipantByReferenceQuery(supabase, {
    domain,
    reference,
  });

  return data;
}

export async function getValidationResultsByParticipantId(
  participantId: number,
) {
  // "use cache";
  // cacheTag(validationResultsByParticipantIdTag({ participantId }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getValidationResultsByParticipantIdQuery(
    supabase,
    participantId,
  );
  return data;
}

export async function getRulesByMarathonId(marathonId: number) {
  // "use cache";
  // cacheTag(rulesByMarathonIdTag({ marathonId }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getRulesByMarathonIdQuery(supabase, marathonId);
  return data;
}

export async function getRulesByDomain(domain: string) {
  // "use cache";
  // cacheTag(rulesByDomainTag({ domain }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getRulesByDomainQuery(supabase, domain);
  return data;
}

export async function getTopicsWithSubmissionCount(marathonId: number) {
  // "use cache";
  // cacheTag(topicsWithSubmissionCountTag({ marathonId }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getTopicsWithSubmissionCountQuery(supabase, marathonId);
  return data;
}

export async function getParticipantVerificationsByStaffId(staffId: string) {
  // "use cache";
  // cacheTag(participantVerificationsByStaffIdTag({ staffId }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getParticipantVerificationsByStaffIdQuery(
    supabase,
    staffId,
  );
  return data;
}

export async function getCachedZippedSubmissionsByMarathonId(
  marathonId: number,
) {
  // "use cache";
  // cacheTag(zippedSubmissionsByMarathonIdTag({ marathonId }));
  // cacheLife("seconds"); // Assuming this data might change, but not too frequently
  const supabase = await createClient();
  const data = await getZippedSubmissionsByDomainQuery(supabase, marathonId); // Note: Original query is ByDomain, but it takes marathonId
  return data;
}

export async function getJuryInvitationsByDomain(
  domain: string,
): Promise<JuryInvitation[]> {
  // "use cache";
  // cacheTag(juryInvitationsByDomainTag({ domain }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const marathon = await getMarathonByDomainQuery(supabase, domain);
  if (!marathon) {
    throw new Error("Marathon not found");
  }
  const data = await getJuryInvitationsByMarathonIdQuery(supabase, marathon.id);
  return data;
}

export async function getJuryInvitationById(
  invitationId: number,
): Promise<JuryInvitation | null> {
  // "use cache";
  // cacheTag(juryInvitationByIdTag({ invitationId }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getJuryInvitationByIdQuery(supabase, invitationId);
  return data;
}

export async function getSubmissionsForJury(filters: {
  domain: string;
  competitionClassId?: number | null;
  deviceGroupId?: number | null;
  topicId?: number | null;
}): Promise<
  (Submission & {
    participant: Participant & {
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
    topic: Topic;
  })[]
> {
  // "use cache";
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getSubmissionsForJuryQuery(supabase, filters);
  return data;
}

export async function getStaffMembersByDomain(
  domain: string,
): Promise<(UserMarathonRelation & { user: User })[]> {
  // "use cache";
  // cacheTag(staffMembersByDomainTag({ domain }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getStaffMembersByDomainQuery(supabase, domain);
  return data;
}

export async function getStaffMemberById(
  staffId: string,
  marathonId: number,
): Promise<(UserMarathonRelation & { user: User }) | null> {
  // "use cache";
  // cacheTag(staffMemberByIdTag({ staffId, marathonId }));
  // cacheLife("seconds");
  const supabase = await createClient();
  const data = await getStaffMemberByIdQuery(supabase, staffId, marathonId);
  return data;
}
