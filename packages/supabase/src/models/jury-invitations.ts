import { createClient } from "../clients/server";
import { type Tables } from "../types/db";

/**
 * Mock table structure for jury_invitations
 * This would be added to the database schema in production
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

// Mock data - would be replaced with actual queries
const mockJuryInvitations: JuryInvitation[] = [
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

// These would be actual Supabase query functions in a real implementation
export async function getJuryInvitationsByMarathon(
  marathonId: number
): Promise<JuryInvitation[]> {
  // In real implementation:
  // const supabase = createClient();
  // const { data, error } = await supabase
  //   .from('jury_invitations')
  //   .select('*')
  //   .eq('marathon_id', marathonId)
  //   .order('created_at', { ascending: false });

  // if (error) throw error;
  // return data;

  return mockJuryInvitations.filter(
    (invitation) => invitation.marathon_id === marathonId
  );
}

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

export async function validateJuryToken(token: string): Promise<{
  valid: boolean;
  marathonId?: number;
  filters?: {
    competitionClassId: number | null;
    deviceGroupId: number | null;
    topicId: number | null;
  };
}> {
  try {
    // In production, this would verify the signature
    const payload = JSON.parse(Buffer.from(token, "base64").toString());

    // Check if token has expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return {
      valid: true,
      marathonId: payload.marathonId,
      filters: payload.filters,
    };
  } catch (error) {
    return { valid: false };
  }
}
