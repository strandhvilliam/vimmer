import type { SupabaseClient } from './types/'
import { toCamelCase } from './utils/format-helpers'

export async function getParticipantByIdQuery(
  supabase: SupabaseClient,
  id: number,
) {
  const { data, ...resp } = await supabase
    .from('participants')
    .select('*, submissions(*)')
    .eq('id', id)
    .maybeSingle()

  return { ...resp, data: toCamelCase(data) }
}

export async function getParticipantByRefQuery(
  supabase: SupabaseClient,
  ref: string,
) {
  const { data, ...resp } = await supabase
    .from('participants')
    .select('*, submissions(*)')
    .eq('ref', ref)
    .maybeSingle()

  return { ...resp, data: toCamelCase(data) }
}

export async function getCompetitionById(supabase: SupabaseClient, id: number) {
  const { data, ...resp } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return { ...resp, data: toCamelCase(data) }
}

export async function getCompetitionByDomain(
  supabase: SupabaseClient,
  domain: string,
) {
  const { data, ...resp } = await supabase
    .from('competitions')
    .select('*')
    .eq('domain', domain)
    .maybeSingle()
  return { ...resp, data: toCamelCase(data) }
}
