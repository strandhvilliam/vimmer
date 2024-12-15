import type { Client } from './types/'

export async function getParticipantByIdQuery(supabase: Client, id: number) {
  return supabase.from('participants').select('*, submissions(*)').eq('id', id).single()
}

export async function getParticipantByRefQuery(supabase: Client, ref: string) {
  return supabase.from('participants').select('*, submissions(*)').eq('ref', ref).single()
}
