import type { SupabaseClient } from "./types/";
import { toCamelCase } from "./utils/format-helpers";

export async function getParticipantByIdQuery(
  supabase: SupabaseClient,
  id: number
) {
  const { data } = await supabase
    .from("participants")
    .select(
      `
        *, 
        submissions(*),
        competition_class:competition_classes(*),
        device_group:device_groups(*)
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
) {
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
) {
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
) {
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
) {
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
) {
  const { data } = await supabase
    .from("user")
    .select(
      `
      *,
      user_marathons (*, marathons (*))
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
) {
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
) {
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
) {
  const { data } = await supabase
    .from("marathons")
    .select("topics(*)")
    .eq("domain", domain)
    .throwOnError();

  return data?.flatMap(({ topics }) => toCamelCase(topics)) ?? [];
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
) {
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

export async function getDeviceGroupsByDomainQuery(
  supabase: SupabaseClient,
  domain: string
) {
  const { data } = await supabase
    .from("marathons")
    .select("device_groups(*)")
    .eq("domain", domain)
    .throwOnError();
  return data?.flatMap(({ device_groups }) => toCamelCase(device_groups)) ?? [];
}

export async function getParticipantsByDomainQuery(
  supabase: SupabaseClient,
  domain: string
) {
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
) {
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
) {
  const { data } = await supabase
    .from("rule_configs")
    .select("*")
    .eq("marathon_id", marathonId)
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}
