export function userMarathonsTag({ userId }: { userId: string }) {
  return `user-marathons-${userId}`;
}

export function topicsByDomainTag({ domain }: { domain: string }) {
  return `topics-${domain}`;
}

export function marathonByDomainTag({ domain }: { domain: string }) {
  return `marathon-${domain}`;
}

export function competitionClassesByDomainTag({ domain }: { domain: string }) {
  return `competition-classes-${domain}`;
}

export function deviceGroupsByDomainTag({ domain }: { domain: string }) {
  return `device-groups-${domain}`;
}

export function participantsByDomainTag({ domain }: { domain: string }) {
  return `participants-${domain}`;
}

export function participantByReferenceTag({
  domain,
  reference,
}: {
  domain: string;
  reference: string;
}) {
  return `participant-${domain}-${reference}`;
}

export function validationResultsByParticipantIdTag({
  participantId,
}: {
  participantId: number;
}) {
  return `validation-results-${participantId}`;
}

export function rulesByMarathonIdTag({ marathonId }: { marathonId: number }) {
  return `rules-${marathonId}`;
}

export function rulesByDomainTag({ domain }: { domain: string }) {
  return `rules-${domain}`;
}

export function topicsWithSubmissionCountTag({
  marathonId,
}: {
  marathonId: number;
}) {
  return `topics-with-submission-count-${marathonId}`;
}

export function participantVerificationsByStaffIdTag({
  staffId,
}: {
  staffId: string;
}) {
  return `participant-verifications-${staffId}`;
}

export function zippedSubmissionsByMarathonIdTag({
  marathonId,
}: {
  marathonId: number;
}) {
  return `zipped-submissions-${marathonId}`;
}

export function juryInvitationsByDomainTag({ domain }: { domain: string }) {
  return `jury-invitations-${domain}`;
}

export function juryInvitationByIdTag({
  invitationId,
}: {
  invitationId: number;
}) {
  return `jury-invitation-${invitationId}`;
}

export function staffMembersByDomainTag({ domain }: { domain: string }) {
  return `staff-members-${domain}`;
}

export function staffMemberByIdTag({ staffId }: { staffId: string }) {
  return `staff-member-${staffId}`;
}
