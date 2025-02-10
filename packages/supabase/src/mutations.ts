import {
  InsertLog,
  InsertParticipant,
  InsertSubmission,
  InsertSubmissionError,
  SupabaseClient,
  UpdateParticipant,
  UpdateSubmission,
} from "./types";
import { toCamelCase, toSnakeCase } from "./utils/format-helpers";

export async function createParticipant(
  supabase: SupabaseClient,
  dto: InsertParticipant,
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
  dto: UpdateParticipant,
) {
  console.log(toSnakeCase(dto));
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
  dto: InsertSubmission,
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
  dto: InsertSubmission[],
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
  dto: UpdateSubmission,
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
  dto: UpdateSubmission,
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
  dto: InsertSubmissionError,
) {
  await supabase.from("submission_errors").insert(toSnakeCase(dto));
}

export async function addMultipleSubmissionErrors(
  supabase: SupabaseClient,
  dtos: InsertSubmissionError[],
) {
  await supabase.from("submission_errors").insert(dtos.map(toSnakeCase));
}

export async function incrementUploadCounter(
  supabase: SupabaseClient,
  participantId: number,
  totalExpected: number,
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
