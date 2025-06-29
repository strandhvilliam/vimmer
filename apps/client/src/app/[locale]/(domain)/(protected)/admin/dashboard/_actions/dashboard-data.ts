"use server";

import { createClient } from "@vimmer/supabase/server";

interface ValidationResult {
  id: number;
  participantId: number;
  ruleKey: string;
  severity: string;
  message: string;
  outcome: string;
  fileName?: string | null;
  createdAt: string;
}

type ParticipantWithValidationResults = {
  id: number;
  marathon_id: number;
  firstname: string;
  lastname: string;
  email: string | null;
  domain: string;
  reference: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  competition_class_id: number | null;
  device_group_id: number | null;
  upload_count: number;
  validationResults: ValidationResult[];
  competitionClass?: {
    id: number;
    name: string;
  } | null;
  deviceGroup?: {
    id: number;
    name: string;
  } | null;
};

/**
 * Fetch marathon data by domain
 */
export async function getMarathonByDomain(domain: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marathons")
    .select("*")
    .eq("domain", domain)
    .single();

  if (error) {
    console.error("Error fetching marathon:", error);
    return null;
  }

  return data;
}

/**
 * Get user marathons
 */
export async function getUserMarathons(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_marathons")
    .select(
      `
      id, 
      role,
      marathon_id,
      marathons(
        id, 
        name, 
        description, 
        domain, 
        start_date, 
        end_date, 
        logo_url
      )
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user marathons:", error);
    return [];
  }

  return data;
}

/**
 * Get participants with validation results
 */
export async function getParticipantsWithValidationResults(
  marathonId: number
): Promise<ParticipantWithValidationResults[]> {
  const supabase = await createClient();

  // Fetch participants
  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select(
      `
      *,
      competitionClass:competition_class_id(id, name),
      deviceGroup:device_group_id(id, name)
    `
    )
    .eq("marathon_id", marathonId);

  if (participantsError || !participants) {
    console.error("Error fetching participants:", participantsError);
    return [];
  }

  // Fetch validation results
  const { data: validationResults, error: validationError } = await supabase
    .from("validation_results")
    .select("*")
    .in(
      "participant_id",
      participants.map((p: any) => p.id)
    );

  if (validationError || !validationResults) {
    console.error("Error fetching validation results:", validationError);
    return participants;
  }

  // Map validation results to participants
  return participants.map((participant: any) => {
    const participantValidationResults = validationResults
      .filter((r: any) => r.participant_id === participant.id)
      .map((result: any) => ({
        id: result.id,
        participantId: result.participant_id,
        ruleKey: result.rule_key,
        severity: result.severity,
        message: result.message,
        outcome: result.outcome,
        fileName: result.file_name,
        createdAt: result.created_at,
      }));

    return {
      ...participant,
      validationResults: participantValidationResults,
    };
  });
}

/**
 * Get device groups
 */
export async function getDeviceGroups(marathonId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("device_groups")
    .select("*")
    .eq("marathon_id", marathonId);

  if (error || !data) {
    console.error("Error fetching device groups:", error);
    return [];
  }

  return data;
}

/**
 * Get competition classes
 */
export async function getCompetitionClasses(marathonId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competition_classes")
    .select("*")
    .eq("marathon_id", marathonId);

  if (error || !data) {
    console.error("Error fetching competition classes:", error);
    return [];
  }

  return data;
}
