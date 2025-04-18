import {
  SupabaseClient as DBClient,
  RealtimeChannel,
} from "@supabase/supabase-js";
import { Database, Tables, TablesInsert, TablesUpdate } from "./db";
import { ToCamelCaseObject } from "./helpers";

export type SupabaseClient = DBClient<Database>;
export type SupabaseRealtimeChannel = RealtimeChannel;

export type Participant = ToCamelCaseObject<Tables<"participants">>;
export type InsertParticipant = ToCamelCaseObject<TablesInsert<"participants">>;
export type UpdateParticipant = ToCamelCaseObject<TablesUpdate<"participants">>;

export type Submission = ToCamelCaseObject<Tables<"submissions">>;
export type InsertSubmission = ToCamelCaseObject<TablesInsert<"submissions">>;
export type UpdateSubmission = ToCamelCaseObject<TablesUpdate<"submissions">>;

export type Marathon = ToCamelCaseObject<Tables<"marathons">>;

export type InsertMarathon = ToCamelCaseObject<TablesInsert<"marathons">>;
export type UpdateMarathon = ToCamelCaseObject<TablesUpdate<"marathons">>;

export type CompetitionClass = ToCamelCaseObject<Tables<"competition_classes">>;
export type InsertCompetitionClass = ToCamelCaseObject<
  TablesInsert<"competition_classes">
>;
export type UpdateCompetitionClass = ToCamelCaseObject<
  TablesUpdate<"competition_classes">
>;

export type DeviceGroup = ToCamelCaseObject<Tables<"device_groups">>;
export type InsertDeviceGroup = ToCamelCaseObject<
  TablesInsert<"device_groups">
>;
export type UpdateDeviceGroup = ToCamelCaseObject<
  TablesUpdate<"device_groups">
>;

export type Topic = ToCamelCaseObject<Tables<"topics">>;
export type InsertTopic = ToCamelCaseObject<TablesInsert<"topics">>;
export type UpdateTopic = ToCamelCaseObject<TablesUpdate<"topics">>;

export type InsertLog = ToCamelCaseObject<TablesInsert<"demologs">>;

export type SelectSubmissionError = ToCamelCaseObject<
  Tables<"submission_errors">
>;
export type InsertSubmissionError = ToCamelCaseObject<
  TablesInsert<"submission_errors">
>;

export type ValidationResult = ToCamelCaseObject<Tables<"validation_results">>;
export type InsertValidationResult = ToCamelCaseObject<
  TablesInsert<"validation_results">
>;
export type UpdateValidationResult = ToCamelCaseObject<
  TablesUpdate<"validation_results">
>;

export type UserData = ToCamelCaseObject<Tables<"user">>;
export type InsertUserData = ToCamelCaseObject<TablesInsert<"user">>;
export type UpdateUserData = ToCamelCaseObject<TablesUpdate<"user">>;

export type ValidationError = ToCamelCaseObject<Tables<"validation_errors">>;
export type InsertValidationError = ToCamelCaseObject<
  TablesInsert<"validation_errors">
>;
export type UpdateValidationError = ToCamelCaseObject<
  TablesUpdate<"validation_errors">
>;

export * from "./db";
export * from "./helpers";
