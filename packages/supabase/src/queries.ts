import type {
  CompetitionClass,
  DeviceGroup,
  JuryInvitation,
  Marathon,
  Participant,
  ParticipantVerification,
  RuleConfig,
  Submission,
  SupabaseClient,
  Topic,
  User,
  UserMarathonRelation,
  ValidationResult,
  ZippedSubmission,
} from "./types/";
import { toCamelCase } from "./utils/format-helpers";

export async function getParticipantByIdQuery(
  supabase: SupabaseClient,
  id: number
): Promise<
  | (Participant & {
      submissions: Submission[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
      validationResults: ValidationResult[];
    })
  | null
> {
  const { data } = await supabase
    .from("participants")
    .select(
      `
        *, 
        submissions(*),
        competition_class:competition_classes(*),
        device_group:device_groups(*),
        validation_results(*)
    `
    )
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}

export async function getParticipantByReferenceQuery(
  supabase: SupabaseClient,
  { reference, domain }: { reference: string; domain: string }
): Promise<
  | (Participant & {
      submissions: Submission[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
      validationResults: ValidationResult[];
    })
  | null
> {
  const { data } = await supabase
    .from("participants")
    .select(
      `
        *, 
        submissions(*),
        competition_class:competition_classes(*),
        device_group:device_groups(*),
        validation_results(*)
    `
    )
    .eq("reference", reference)
    .eq("domain", domain)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}

export async function getMarathonWithConfigByIdQuery(
  supabase: SupabaseClient,
  id: number
): Promise<
  | (Marathon & {
      competitionClasses: CompetitionClass[];
      deviceGroups: DeviceGroup[];
      topics: Topic[];
    })
  | null
> {
  const { data } = await supabase
    .from("marathons")
    .select(
      `
      *,
      competition_classes (*),
      device_groups (*),
      topics (*)
      `
    )
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}

export async function getMarathonWithConfigByDomainQuery(
  supabase: SupabaseClient,
  domain: string
): Promise<
  | (Marathon & {
      competitionClasses: CompetitionClass[];
      deviceGroups: DeviceGroup[];
      topics: Topic[];
    })
  | null
> {
  const { data } = await supabase
    .from("marathons")
    .select(
      `
      *,
      competition_classes (*),
      device_groups (*),
      topics (*)
      `
    )
    .eq("domain", domain)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}

export async function getManySubmissionsByKeysQuery(
  supabase: SupabaseClient,
  keys: string[]
): Promise<Submission[]> {
  const { data } = await supabase
    .from("submissions")
    .select()
    .in("key", keys)
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getUserWithMarathonsQuery(
  supabase: SupabaseClient,
  userId: string
): Promise<
  | (User & {
      userMarathons: (UserMarathonRelation & {
        marathon: Marathon;
      })[];
    })
  | null
> {
  const { data } = await supabase
    .from("user")
    .select(
      `
      *,
      user_marathons (*, marathon:marathons (*))
      `
    )
    .eq("id", userId)
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
}

export async function getMarathonsByUserIdQuery(
  supabase: SupabaseClient,
  userId: string
): Promise<Marathon[]> {
  const { data } = await supabase
    .from("user_marathons")
    .select("marathons(*)")
    .eq("user_id", userId)
    .throwOnError();
  return data?.flatMap(({ marathons }) => marathons).map(toCamelCase) ?? [];
}

export async function getTopicsByMarathonIdQuery(
  supabase: SupabaseClient,
  marathonId: number
): Promise<Topic[]> {
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("marathon_id", marathonId)
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getTopicsByDomainQuery(
  supabase: SupabaseClient,
  domain: string
): Promise<Topic[]> {
  const { data } = await supabase
    .from("marathons")
    .select("topics(*)")
    .eq("domain", domain)
    .throwOnError();

  return data?.flatMap(({ topics }) => toCamelCase(topics)) ?? [];
}

export async function getTopicByIdQuery(supabase: SupabaseClient, id: number) {
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
}

export async function getTopicsWithSubmissionCountQuery(
  supabase: SupabaseClient,
  marathonId: number
) {
  const { data } = await supabase
    .from("topics")
    .select("id, submissions:submissions(count)", {
      count: "exact",
    })
    .eq("marathon_id", marathonId)
    .throwOnError();

  console.log(data);
  return data?.map(toCamelCase) ?? [];
}

export async function getTotalSubmissionCountQuery(
  supabase: SupabaseClient,
  marathonId: number
) {
  const { data } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("marathon_id", marathonId)
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getMarathonByDomainQuery(
  supabase: SupabaseClient,
  domain: string
) {
  const { data } = await supabase
    .from("marathons")
    .select("*")
    .eq("domain", domain)
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
}

export async function getScheduledTopicsQuery(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("topics")
    .select("*, marathon:marathons(*)")
    .eq("visibility", "scheduled")
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getCompetitionClassesByDomainQuery(
  supabase: SupabaseClient,
  domain: string
): Promise<CompetitionClass[]> {
  const { data } = await supabase
    .from("marathons")
    .select("competition_classes(*)")
    .eq("domain", domain)
    .throwOnError();
  return (
    data?.flatMap(({ competition_classes }) =>
      toCamelCase(competition_classes)
    ) ?? []
  );
}

export async function getCompetitionClassByIdQuery(
  supabase: SupabaseClient,
  id: number
): Promise<CompetitionClass | null> {
  const { data } = await supabase
    .from("competition_classes")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
}

export async function getDeviceGroupsByDomainQuery(
  supabase: SupabaseClient,
  domain: string
): Promise<DeviceGroup[]> {
  const { data } = await supabase
    .from("marathons")
    .select("device_groups(*)")
    .eq("domain", domain)
    .throwOnError();
  return data?.flatMap(({ device_groups }) => toCamelCase(device_groups)) ?? [];
}

export async function getDeviceGroupByIdQuery(
  supabase: SupabaseClient,
  id: number
): Promise<DeviceGroup | null> {
  const { data } = await supabase
    .from("device_groups")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
}

export async function getParticipantsByDomainQuery(
  supabase: SupabaseClient,
  domain: string
): Promise<
  (Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
    validationResults: ValidationResult[];
  })[]
> {
  const { data } = await supabase
    .from("participants")
    .select(
      `
      *,
      competition_class:competition_classes(*),
      device_group:device_groups(*),
      validation_results(*)
      `
    )
    .eq("domain", domain)
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getValidationResultsByParticipantIdQuery(
  supabase: SupabaseClient,
  participantId: number
): Promise<ValidationResult[]> {
  const { data } = await supabase
    .from("validation_results")
    .select(
      `
      *,
      participant:participants(*)
      `
    )
    .eq("participant_id", participantId)
    .throwOnError();

  return data?.map(toCamelCase) ?? [];
}

export async function getRulesByMarathonIdQuery(
  supabase: SupabaseClient,
  marathonId: number
): Promise<RuleConfig[]> {
  const { data } = await supabase
    .from("rule_configs")
    .select("*")
    .eq("marathon_id", marathonId)
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getJuryInvitationsByMarathonIdQuery(
  supabase: SupabaseClient,
  marathonId: number
): Promise<JuryInvitation[]> {
  const { data } = await supabase
    .from("jury_invitations")
    .select("*")
    .eq("marathon_id", marathonId)
    .order("created_at", { ascending: false })
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getJuryInvitationByIdQuery(
  supabase: SupabaseClient,
  invitationId: number
): Promise<JuryInvitation | null> {
  const { data } = await supabase
    .from("jury_invitations")
    .select("*")
    .eq("id", invitationId)
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
}

export async function getParticipantVerificationsByStaffIdQuery(
  supabase: SupabaseClient,
  staffId: string
): Promise<
  (ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  })[]
> {
  const { data } = await supabase
    .from("participant_verifications")
    .select(
      `
      *,
      participant:participants(
        *,
        competition_class:competition_classes(*),
        device_group:device_groups(*),
        validation_results(*)
      )
      `
    )
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false })
    .throwOnError();

  return data?.map(toCamelCase) ?? [];
}

export async function getZippedSubmissionsByDomainQuery(
  supabase: SupabaseClient,
  marathonId: number
): Promise<ZippedSubmission[]> {
  const { data } = await supabase
    .from("zipped_submissions")
    .select("*")
    .eq("marathon_id", marathonId)
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getSubmissionsForJuryQuery(
  supabase: SupabaseClient,
  filters: {
    domain: string;
    competitionClassId?: number | null;
    deviceGroupId?: number | null;
    topicId?: number | null;
  }
): Promise<
  (Submission & {
    participant: Participant & {
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
    topic: Topic;
  })[]
> {
  const { data: marathon } = await supabase
    .from("marathons")
    .select("id")
    .eq("domain", filters.domain)
    .maybeSingle()
    .throwOnError();

  if (!marathon) {
    return [];
  }

  let query = supabase
    .from("submissions")
    .select(
      `
      *,
      participant:participants!inner(
        *,
        competition_class:competition_classes(*),
        device_group:device_groups(*)
      ),
      topic:topics(*)
      `
    )
    .eq("marathon_id", marathon.id)
    .eq("status", "uploaded");

  if (
    filters.competitionClassId !== null &&
    filters.competitionClassId !== undefined
  ) {
    query = query.eq(
      "participant.competition_class_id",
      filters.competitionClassId
    );
  }

  if (filters.deviceGroupId !== null && filters.deviceGroupId !== undefined) {
    query = query.eq("participant.device_group_id", filters.deviceGroupId);
  }

  if (filters.topicId !== null && filters.topicId !== undefined) {
    query = query.eq("topic_id", filters.topicId);
  }

  const { data } = await query.throwOnError();
  return data?.map(toCamelCase) ?? [];
}

export async function getUserByEmailWithMarathonsQuery(
  supabase: SupabaseClient,
  email: string
): Promise<(User & { userMarathons: UserMarathonRelation[] }) | null> {
  const { data } = await supabase
    .from("user")
    .select("*, user_marathons(*)")
    .eq("email", email)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}

export async function getStaffMembersByDomainQuery(
  supabase: SupabaseClient,
  domain: string
): Promise<(UserMarathonRelation & { user: User })[]> {
  const { data } = await supabase
    .from("user_marathons")
    .select("*, user(*), marathons(*)")
    .eq("marathons.domain", domain)
    .throwOnError();

  return (
    data?.map(({ marathons: _, ...rest }) => ({
      ...toCamelCase(rest),
    })) ?? []
  );
}

export async function getStaffMemberByIdQuery(
  supabase: SupabaseClient,
  staffId: string
): Promise<
  | (UserMarathonRelation & {
      user: User & { participantVerifications: ParticipantVerification[] };
    })
  | null
> {
  const { data } = await supabase
    .from("user_marathons")
    .select("*, user(*, participant_verifications(*))")
    .eq("user_id", staffId)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}
