import type { Marathon, Participant, SupabaseClient } from "./types/";
import { toCamelCase } from "./utils/format-helpers";

export async function getParticipantById(supabase: SupabaseClient, id: number) {
  const { data } = await supabase
    .from("participants")
    .select(
      `
        *, 
        submissions(*),
        competition_classes(*),
        device_groups(*)
    `,
    )
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}

export async function getParticipantByReference(
  supabase: SupabaseClient,
  reference: string,
  marathonId: number,
) {
  const { data } = await supabase
    .from("participants")
    .select("*, submissions(*)")
    .eq("reference", reference)
    .eq("marathon_id", marathonId)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}

export async function getMarathonWithConfigById(
  supabase: SupabaseClient,
  id: number,
) {
  const { data } = await supabase
    .from("marathons")
    .select(
      `
      *,
      competition_classes (*),
      device_groups (*),
      topics (*)
      `,
    )
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return toCamelCase(data);
}

export async function getMarathonWithConfigByDomain(
  supabase: SupabaseClient,
  domain: string,
) {
  const { data } = await supabase
    .from("marathons")
    .select(
      `
      *,
      competition_classes (*),
      device_groups (*),
      topics (*)
      `,
    )
    .eq("domain", domain)
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
}

export async function getManySubmissionsByKeys(
  supabase: SupabaseClient,
  keys: string[],
) {
  const { data } = await supabase
    .from("submissions")
    .select()
    .in("key", keys)
    .throwOnError();
  return data?.map(toCamelCase) ?? [];
}
