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

export async function updateMarathonByDomain(
  supabase: SupabaseClient,
  domain: string,
  dto: UpdateMarathon
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
  dto: InsertValidationResult[]
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
  dto: InsertRuleConfig
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
  dto: UpdateRuleConfig
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

export async function deleteRuleConfig(supabase: SupabaseClient, id: number) {
  await supabase.from("rule_configs").delete().eq("id", id);
}

export async function createParticipantVerification(
  supabase: SupabaseClient,
  dto: InsertParticipantVerification
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
  dto: UpdateValidationResult
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

/**
 * Jury Invitations
 */

export interface JuryInvitation {
  id: string;
  marathon_id: number;
  email: string;
  notes: string | null;
  status: "pending" | "in_progress" | "completed";
  token: string;
  sent_at: string;
  expires_at: string;
  competition_class_id: number | null;
  device_group_id: number | null;
  topic_id: number | null;
  created_at: string;
  updated_at: string | null;
}

// Mock data - would be replaced with actual database queries
export const mockJuryInvitations: JuryInvitation[] = [
  {
    id: "1",
    marathon_id: 1,
    email: "jury1@example.com",
    notes: "Please review landscape photos",
    status: "completed",
    token: "token_123",
    sent_at: new Date("2023-10-01").toISOString(),
    expires_at: new Date("2023-10-15").toISOString(),
    competition_class_id: 1,
    device_group_id: null,
    topic_id: null,
    created_at: new Date("2023-10-01").toISOString(),
    updated_at: null,
  },
  {
    id: "2",
    marathon_id: 1,
    email: "jury2@example.com",
    notes: "Mobile category review",
    status: "in_progress",
    token: "token_456",
    sent_at: new Date("2023-10-05").toISOString(),
    expires_at: new Date("2023-10-20").toISOString(),
    competition_class_id: null,
    device_group_id: 2,
    topic_id: null,
    created_at: new Date("2023-10-05").toISOString(),
    updated_at: null,
  },
  {
    id: "3",
    marathon_id: 1,
    email: "jury3@example.com",
    notes: "Focus on portrait theme",
    status: "pending",
    token: "token_789",
    sent_at: new Date("2023-10-10").toISOString(),
    expires_at: new Date("2023-10-25").toISOString(),
    competition_class_id: null,
    device_group_id: null,
    topic_id: 3,
    created_at: new Date("2023-10-10").toISOString(),
    updated_at: null,
  },
];

export async function createJuryInvitation(
  invitation: Omit<JuryInvitation, "id" | "created_at" | "updated_at">
): Promise<JuryInvitation> {
  // In real implementation:
  // const supabase = createClient();
  // const { data, error } = await supabase
  //   .from('jury_invitations')
  //   .insert([
  //     { ...invitation, created_at: new Date().toISOString() }
  //   ])
  //   .select()
  //   .single();

  // if (error) throw error;
  // return data;

  const newInvitation: JuryInvitation = {
    id: `inv_${Date.now()}`,
    ...invitation,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  mockJuryInvitations.push(newInvitation);
  return newInvitation;
}

export async function updateJuryInvitationStatus(
  id: string,
  status: JuryInvitation["status"]
): Promise<JuryInvitation> {
  // In real implementation:
  // const supabase = createClient();
  // const { data, error } = await supabase
  //   .from('jury_invitations')
  //   .update({ status, updated_at: new Date().toISOString() })
  //   .eq('id', id)
  //   .select()
  //   .single();

  // if (error) throw error;
  // return data;

  const invitation = mockJuryInvitations.find((inv) => inv.id === id);
  if (!invitation) {
    throw new Error(`Jury invitation with id ${id} not found`);
  }

  invitation.status = status;
  invitation.updated_at = new Date().toISOString();

  return invitation;
}

export async function generateJuryToken(
  marathonId: number,
  competitionClassId: number | null,
  deviceGroupId: number | null,
  topicId: number | null
): Promise<string> {
  // In a real implementation, this would create a JWT or other secure token
  // containing the necessary information to identify what submissions to show

  const payload = {
    marathonId,
    filters: {
      competitionClassId,
      deviceGroupId,
      topicId,
    },
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, // 14 days expiry
  };

  // In production, this would be signed with a secret key
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export const createZippedSubmission = async (
  supabase: SupabaseClient,
  dto: InsertZippedSubmission
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
  dto: UpdateZippedSubmission
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
