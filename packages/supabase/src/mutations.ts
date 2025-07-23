import {
  InsertCompetitionClass,
  InsertDeviceGroup,
  InsertParticipant,
  InsertSubmission,
  InsertTopic,
  SupabaseClient,
  UpdateCompetitionClass,
  UpdateDeviceGroup,
  UpdateParticipant,
  UpdateSubmission,
  UpdateTopic,
  UpdateMarathon,
  InsertValidationResult,
  InsertRuleConfig,
  UpdateRuleConfig,
  InsertParticipantVerification,
  UpdateValidationResult,
  InsertZippedSubmission,
  UpdateZippedSubmission,
  InsertJuryInvitation,
  JuryInvitation,
  UpdateJuryInvitation,
  InsertUser,
  InsertUserMarathonRelation,
  UpdateUserMarathonRelation,
} from "./types";
import { toCamelCase, toSnakeCase } from "./utils/format-helpers";
import crypto from "crypto";

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

export async function updateTopic(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateTopic,
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
  marathonId: number,
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
  dto: InsertDeviceGroup,
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
  dto: UpdateDeviceGroup,
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
  dto: InsertCompetitionClass,
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
  id: number,
) {
  await supabase.from("competition_classes").delete().eq("id", id);
}

export async function updateCompetitionClass(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateCompetitionClass,
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

export async function updateMarathonByDomain(
  supabase: SupabaseClient,
  domain: string,
  dto: UpdateMarathon,
) {
  if (!dto.updatedAt) {
    dto.updatedAt = new Date().toISOString();
  }

  const { data } = await supabase
    .from("marathons")
    .update(toSnakeCase(dto))
    .eq("domain", domain)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function insertValidationResults(
  supabase: SupabaseClient,
  dto: InsertValidationResult[],
) {
  const { data } = await supabase
    .from("validation_results")
    .insert(dto.map(toSnakeCase))
    .select()
    .throwOnError();
  return data ? toCamelCase(data) : [];
}

export async function addRuleConfig(
  supabase: SupabaseClient,
  dto: InsertRuleConfig,
) {
  const { data } = await supabase
    .from("rule_configs")
    .insert(toSnakeCase(dto))
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function updateRuleConfig(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateRuleConfig,
) {
  const { data } = await supabase
    .from("rule_configs")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function updateRuleConfigByMarathonIdAndRuleKey(
  supabase: SupabaseClient,
  marathonId: number,
  ruleKey: string,
  dto: Partial<UpdateRuleConfig>,
) {
  const { data } = await supabase
    .from("rule_configs")
    .update(toSnakeCase(dto))
    .eq("marathon_id", marathonId)
    .eq("rule_key", ruleKey)
    .select()
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
}

export async function deleteRuleConfig(supabase: SupabaseClient, id: number) {
  await supabase.from("rule_configs").delete().eq("id", id);
}

export async function createParticipantVerification(
  supabase: SupabaseClient,
  dto: InsertParticipantVerification,
) {
  const { data } = await supabase
    .from("participant_verifications")
    .insert(toSnakeCase(dto))
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export async function updateValidationResult(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateValidationResult,
) {
  const { data } = await supabase
    .from("validation_results")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();

  return toCamelCase(data);
}

export async function createJuryInvitation(
  supabase: SupabaseClient,
  invitation: InsertJuryInvitation,
): Promise<JuryInvitation> {
  const { data } = await supabase
    .from("jury_invitations")
    .insert(toSnakeCase(invitation))
    .select()
    .single()
    .throwOnError();

  return toCamelCase(data);
}

export async function deleteJuryInvitation(
  supabase: SupabaseClient,
  id: number,
) {
  await supabase.from("jury_invitations").delete().eq("id", id).throwOnError();
}

export async function updateJuryInvitation(
  supabase: SupabaseClient,
  id: number,
  dto: UpdateJuryInvitation,
) {
  if (!dto.updatedAt) {
    dto.updatedAt = new Date().toISOString();
  }

  const { data } = await supabase
    .from("jury_invitations")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
}

export const createZippedSubmission = async (
  supabase: SupabaseClient,
  dto: InsertZippedSubmission,
) => {
  const { data } = await supabase
    .from("zipped_submissions")
    .insert(toSnakeCase(dto))
    .select()
    .maybeSingle()
    .throwOnError();
  return toCamelCase(data);
};

export const updateZippedSubmission = async (
  supabase: SupabaseClient,
  id: number,
  dto: UpdateZippedSubmission,
) => {
  const { data } = await supabase
    .from("zipped_submissions")
    .update(toSnakeCase(dto))
    .eq("id", id)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
};

export const createUser = async (
  supabase: SupabaseClient,
  dto: Pick<InsertUser, "email" | "name">,
) => {
  const { data } = await supabase
    .from("user")
    .insert({
      id: crypto.randomUUID(),
      ...dto,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
};

export const createUserMarathonRelation = async (
  supabase: SupabaseClient,
  dto: InsertUserMarathonRelation,
) => {
  const { data } = await supabase
    .from("user_marathons")
    .insert(toSnakeCase(dto))
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
};

export const updateUserMarathonRelation = async (
  supabase: SupabaseClient,
  userId: string,
  marathonId: number,
  dto: Partial<Pick<UpdateUserMarathonRelation, "role">>,
) => {
  const { data } = await supabase
    .from("user_marathons")
    .update(toSnakeCase(dto))
    .eq("user_id", userId)
    .eq("marathon_id", marathonId)
    .select()
    .single()
    .throwOnError();
  return toCamelCase(data);
};

export const deleteUserMarathonRelation = async (
  supabase: SupabaseClient,
  userId: string,
  marathonId: number,
) => {
  await supabase
    .from("user_marathons")
    .delete()
    .eq("user_id", userId)
    .eq("marathon_id", marathonId)
    .throwOnError();
};
