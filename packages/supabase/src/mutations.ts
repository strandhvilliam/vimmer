import { getTopicsByDomain } from "./cached-queries";
import {
  InsertCompetitionClass,
  InsertDeviceGroup,
  InsertLog,
  InsertParticipant,
  InsertSubmission,
  InsertSubmissionError,
  InsertTopic,
  SupabaseClient,
  UpdateCompetitionClass,
  UpdateDeviceGroup,
  UpdateParticipant,
  UpdateSubmission,
  UpdateTopic,
} from "./types";
import { toCamelCase, toSnakeCase } from "./utils/format-helpers";

export async function createParticipant(
  supabase: SupabaseClient,
  dto: InsertParticipant
) {
  const { data } = await supabase
    .from("participants")
    .insert(toSnakeCase(dto))
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function updateParticipant(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateParticipant
) {
  const { data } = await supabase
    .from("participants")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function createSubmission(
  supabase: SupabaseClient,
  dto: InsertSubmission
) {
  const { data } = await supabase
    .from("submissions")
    .insert(toSnakeCase(dto))
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function createMultipleSubmissions(
  supabase: SupabaseClient,
  dto: InsertSubmission[]
) {
  const { data } = await supabase
    .from("submissions")
    .insert(dto.map(toSnakeCase))
    .select()
    .throwOnError();
  return data ? toCamelCase(data) : [];
}

export async function insertLog(supabase: SupabaseClient, data: InsertLog) {
  const { data: log } = await supabase
    .from("demologs")
    .insert(toSnakeCase(data))
    .select()
    .throwOnError();
  return toCamelCase(log);
}

export async function updateSubmissionByKey(
  supabase: SupabaseClient,
  key: string,
  dto: UpdateSubmission
) {
  const { data } = await supabase
    .from("submissions")
    .update(toSnakeCase(dto))
    .eq("key", key)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function updateSubmissionById(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateSubmission
) {
  const { data } = await supabase
    .from("submissions")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function addSubmissionError(
  supabase: SupabaseClient,
  dto: InsertSubmissionError
) {
  await supabase.from("submission_errors").insert(toSnakeCase(dto));
}

export async function addMultipleSubmissionErrors(
  supabase: SupabaseClient,
  dtos: InsertSubmissionError[]
) {
  await supabase.from("submission_errors").insert(dtos.map(toSnakeCase));
}

export async function incrementUploadCounter(
  supabase: SupabaseClient,
  participantId: number,
  totalExpected: number
) {
  const { data } = await supabase
    .rpc("increment_upload_counter", {
      participant_id: participantId,
      total_expected: totalExpected,
    })
    .throwOnError();

  return toCamelCase(data) as {
    uploadCount: number;
    status: string;
    isComplete: boolean;
  };
}

export async function updateTopic(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateTopic
) {
  if (!dto.updatedAt) {
    dto.updatedAt = new Date().toISOString();
  }

  const { data } = await supabase
    .from("topics")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function updateTopicsOrder(
  supabase: SupabaseClient,
  topicIds: number[],
  marathonId: number
) {
  await supabase
    .rpc("update_topic_order", {
      p_topic_ids: topicIds,
      p_marathon_id: marathonId,
    })
    .throwOnError();
}

export async function createTopic(supabase: SupabaseClient, dto: InsertTopic) {
  const { data } = await supabase
    .from("topics")
    .insert(toSnakeCase(dto))
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function deleteTopic(supabase: SupabaseClient, id: number) {
  await supabase.from("topics").delete().eq("id", id);
}

export async function createDeviceGroup(
  supabase: SupabaseClient,
  dto: InsertDeviceGroup
) {
  const { data } = await supabase
    .from("device_groups")
    .insert(toSnakeCase(dto))
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function deleteDeviceGroup(supabase: SupabaseClient, id: number) {
  await supabase.from("device_groups").delete().eq("id", id);
}

export async function updateDeviceGroup(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateDeviceGroup
) {
  const { data } = await supabase
    .from("device_groups")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function createCompetitionClass(
  supabase: SupabaseClient,
  dto: InsertCompetitionClass
) {
  const { data } = await supabase
    .from("competition_classes")
    .insert(toSnakeCase(dto))
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function deleteCompetitionClass(
  supabase: SupabaseClient,
  id: number
) {
  await supabase.from("competition_classes").delete().eq("id", id);
}

export async function updateCompetitionClass(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateCompetitionClass
) {
  const { data } = await supabase
    .from("competition_classes")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}
