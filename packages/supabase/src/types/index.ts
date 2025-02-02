import {
  SupabaseClient as DBClient,
  RealtimeChannel,
} from "@supabase/supabase-js";
import { Database, Tables, TablesInsert, TablesUpdate } from "./db";
import { ToCamelCaseObject } from "./helpers";

export type SupabaseClient = DBClient<Database>;
export type SupabaseRealtimeChannel = RealtimeChannel;

export type Participant = ToCamelCaseObject<TablesInsert<"participants">>;
export type SelectParticipant = ToCamelCaseObject<Tables<"participants">>;
export type UpdateParticipant = ToCamelCaseObject<TablesUpdate<"participants">>;

export type Submission = ToCamelCaseObject<TablesInsert<"submissions">>;
export type SelectSubmission = ToCamelCaseObject<Tables<"submissions">>;
export type UpdateSubmission = ToCamelCaseObject<TablesUpdate<"submissions">>;

export type Marathon = ToCamelCaseObject<Tables<"marathons">>;
export type InsertMarathon = ToCamelCaseObject<TablesInsert<"marathons">>;
export type UpdateMarathon = ToCamelCaseObject<TablesUpdate<"marathons">>;

export type CompetitionClass = ToCamelCaseObject<
  TablesInsert<"competition_classes">
>;
export type InsertCompetitionClass = ToCamelCaseObject<
  TablesInsert<"competition_classes">
>;
export type UpdateCompetitionClass = ToCamelCaseObject<
  TablesUpdate<"competition_classes">
>;

export type DeviceGroup = ToCamelCaseObject<TablesInsert<"device_groups">>;
export type InsertDeviceGroup = ToCamelCaseObject<
  TablesInsert<"device_groups">
>;
export type UpdateDeviceGroup = ToCamelCaseObject<
  TablesUpdate<"device_groups">
>;

export type Topic = ToCamelCaseObject<TablesInsert<"topics">>;
export type InsertTopic = ToCamelCaseObject<TablesInsert<"topics">>;
export type UpdateTopic = ToCamelCaseObject<TablesUpdate<"topics">>;

export type InsertLog = ToCamelCaseObject<TablesInsert<"demologs">>;

export type SelectSubmissionError = ToCamelCaseObject<
  Tables<"submission_errors">
>;
export type InsertSubmissionError = ToCamelCaseObject<
  TablesInsert<"submission_errors">
>;
export * from "./db";
