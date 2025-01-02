import {
  SupabaseClient as DBClient,
  RealtimeChannel,
} from '@supabase/supabase-js'
import { Database, Tables, TablesInsert, TablesUpdate } from './db'

type ToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<ToCamelCase<U>>}`
  : S

type ToCamelCaseObject<T> =
  T extends Array<infer U>
    ? Array<ToCamelCaseObject<U>>
    : T extends object
      ? {
          [K in keyof T as K extends string
            ? ToCamelCase<K>
            : K]: ToCamelCaseObject<T[K]>
        }
      : T

export type SupabaseClient = DBClient<Database>
export type SupabaseRealtimeChannel = RealtimeChannel

export * from './db'

export type InsertParticipant = ToCamelCaseObject<TablesInsert<'participants'>>
export type SelectParticipant = ToCamelCaseObject<Tables<'participants'>>
export type UpdateParticipant = ToCamelCaseObject<TablesUpdate<'participants'>>

export type InsertSubmission = ToCamelCaseObject<TablesInsert<'submissions'>>
export type SelectSubmission = ToCamelCaseObject<Tables<'submissions'>>
export type UpdateSubmission = ToCamelCaseObject<TablesUpdate<'submissions'>>

export type InsertLog = ToCamelCaseObject<TablesInsert<'demologs'>>

export type SelectSubmissionError = ToCamelCaseObject<
  Tables<'submission_errors'>
>
export type InsertSubmissionError = ToCamelCaseObject<
  TablesInsert<'submission_errors'>
>
