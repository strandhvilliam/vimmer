import {
  InsertLog,
  InsertParticipant,
  InsertSubmission,
  SupabaseClient,
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
