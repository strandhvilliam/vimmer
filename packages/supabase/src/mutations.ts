import {
  InsertLog,
  InsertParticipant,
  InsertSubmission,
  InsertSubmissionError,
  SupabaseClient,
  UpdateParticipant,
  UpdateSubmission,
} from './types'
import { toCamelCase, toSnakeCase } from './utils/format-helpers'

export async function createParticipant(
  supabase: SupabaseClient,
  dto: InsertParticipant,
) {
  const { data, ...resp } = await supabase
    .from('participants')
    .insert(toSnakeCase(dto))
    .select()
    .single()
  return { data: toCamelCase(data), ...resp }
}

export async function updateParticipant(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateParticipant,
) {
  const { data, ...resp } = await supabase
    .from('participants')
    .update(toSnakeCase(dto))
    .eq('id', id)
    .select()
    .single()
  return { data: toCamelCase(data), ...resp }
}

export async function createSubmission(
  supabase: SupabaseClient,
  dto: InsertSubmission,
) {
  const { data, ...resp } = await supabase
    .from('submissions')
    .insert(toSnakeCase(dto))
    .select()
    .single()

  return { data: toCamelCase(data), ...resp }
}

export async function createMultipleSubmissions(
  supabase: SupabaseClient,
  dto: InsertSubmission[],
) {
  const { data, ...resp } = await supabase
    .from('submissions')
    .insert(dto.map(toSnakeCase))
    .select()
  return { data: toCamelCase(data) ?? [], ...resp }
}

export async function insertLog(supabase: SupabaseClient, data: InsertLog) {
  const { data: log, ...resp } = await supabase
    .from('demologs')
    .insert(toSnakeCase(data))
    .select()
  return { data: toCamelCase(log), ...resp }
}

export async function updateSubmissionByKey(
  supabase: SupabaseClient,
  key: string,
  dto: UpdateSubmission,
) {
  const { data, ...resp } = await supabase
    .from('submissions')
    .update(toSnakeCase(dto))
    .eq('key', key)
    .select()
    .single()
  return { data: toCamelCase(data), ...resp }
}

export async function updateSubmissionById(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateSubmission,
) {
  const { data, ...resp } = await supabase
    .from('submissions')
    .update(toSnakeCase(dto))
    .eq('id', id)
    .select()
    .single()
  return { data: toCamelCase(data), ...resp }
}

export async function addSubmissionError(
  supabase: SupabaseClient,
  dto: InsertSubmissionError,
) {
  await supabase.from('submission_errors').insert(toSnakeCase(dto))
}

export async function addMultipleSubmissionErrors(
  supabase: SupabaseClient,
  dtos: InsertSubmissionError[],
) {
  await supabase.from('submission_errors').insert(dtos.map(toSnakeCase))
}
