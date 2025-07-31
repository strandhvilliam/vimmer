import { eq, and, desc } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import {
  submissions,
  participants,
  marathons,
  juryInvitations,
  juryRatings,
} from "@vimmer/api/db/schema";
import type {
  CompetitionClass,
  DeviceGroup,
  NewJuryInvitation,
  Participant,
  Submission,
} from "@vimmer/api/db/types";
import { TRPCError } from "@trpc/server";
import { jwtVerify } from "jose";
import { z } from "zod";

export async function getJurySubmissionsQuery(
  db: Database,
  filters: {
    domain: string;
    competitionClassId?: number | null;
    deviceGroupId?: number | null;
    topicId?: number | null;
  },
) {
  const marathon = await db
    .select({ id: marathons.id })
    .from(marathons)
    .where(eq(marathons.domain, filters.domain))
    .limit(1);

  if (!marathon.length) {
    return [];
  }

  const marathonId = marathon[0]!.id;

  const conditions = [
    eq(submissions.marathonId, marathonId),
    eq(submissions.status, "uploaded"),
  ];

  if (
    filters.competitionClassId !== null &&
    filters.competitionClassId !== undefined
  ) {
    conditions.push(
      eq(participants.competitionClassId, filters.competitionClassId),
    );
  }

  if (filters.deviceGroupId !== null && filters.deviceGroupId !== undefined) {
    conditions.push(eq(participants.deviceGroupId, filters.deviceGroupId));
  }

  if (filters.topicId !== null && filters.topicId !== undefined) {
    conditions.push(eq(submissions.topicId, filters.topicId));
  }

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: {
      participant: {
        with: {
          competitionClass: true,
          deviceGroup: true,
        },
      },
      topic: true,
    },
  });

  return result;
}

export async function getJuryInvitationsByMarathonIdQuery(
  db: Database,
  { id }: { id: number },
) {
  const result = await db.query.juryInvitations.findMany({
    where: eq(juryInvitations.marathonId, id),
    orderBy: [desc(juryInvitations.createdAt)],
  });
  return result;
}

export async function getJuryInvitationByIdQuery(
  db: Database,
  { id }: { id: number },
) {
  const result = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, id),
  });
  return result ?? null;
}

export async function getJuryInvitationsByDomainQuery(
  db: Database,
  { domain }: { domain: string },
) {
  const marathon = await db
    .select({ id: marathons.id })
    .from(marathons)
    .where(eq(marathons.domain, domain))
    .limit(1);

  if (!marathon.length) {
    return [];
  }

  const marathonId = marathon[0]!.id;

  const result = await db.query.juryInvitations.findMany({
    where: eq(juryInvitations.marathonId, marathonId),
    orderBy: [desc(juryInvitations.createdAt)],
    with: {
      competitionClass: true,
      deviceGroup: true,
      topic: true,
    },
  });

  return result;
}

export async function createJuryInvitationMutation(
  db: Database,
  { data }: { data: NewJuryInvitation },
) {
  const result = await db
    .insert(juryInvitations)
    .values(data)
    .returning({ id: juryInvitations.id });

  if (!result[0]?.id) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create jury invitation",
    });
  }

  return result[0].id;
}

export async function updateJuryInvitationMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewJuryInvitation> },
) {
  const result = await db
    .update(juryInvitations)
    .set(data)
    .where(eq(juryInvitations.id, id))
    .returning({ id: juryInvitations.id });
  return result[0]?.id ?? null;
}

export async function deleteJuryInvitationMutation(
  db: Database,
  { id }: { id: number },
) {
  const result = await db
    .delete(juryInvitations)
    .where(eq(juryInvitations.id, id))
    .returning({ id: juryInvitations.id });
  return result[0]?.id ?? null;
}

const TokenPayloadSchema = z.object({
  domain: z.string(),
  invitationId: z.number(),
  iat: z.number(),
  exp: z.number(),
});

async function verifyJuryToken(token: string) {
  try {
    const secret = process.env.JURY_JWT_SECRET;
    if (!secret) {
      throw new Error("JWT SECRET is not set");
    }
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    const parsed = TokenPayloadSchema.safeParse(payload);
    if (parsed.success) {
      return parsed.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyJuryTokenAndGetDataQuery(
  db: Database,
  { token }: { token: string },
) {
  const tokenPayload = await verifyJuryToken(token);

  if (!tokenPayload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenPayload.exp < now) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token expired",
    });
  }

  const invitation = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, tokenPayload.invitationId),
    with: {
      competitionClass: true,
      deviceGroup: true,
      topic: true,
    },
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found",
    });
  }

  const marathon = await db.query.marathons.findFirst({
    where: eq(marathons.domain, tokenPayload.domain),
  });

  if (!marathon || invitation.marathonId !== marathon.id) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Marathon not found",
    });
  }

  const invitationExpiry = new Date(invitation.expiresAt);
  if (invitationExpiry < new Date()) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invitation expired",
    });
  }

  const submissions = await getJurySubmissionsQuery(db, {
    domain: tokenPayload.domain,
    competitionClassId: invitation.competitionClassId,
    deviceGroupId: invitation.deviceGroupId,
    topicId: invitation.topicId,
  });

  return {
    invitation,
    marathon,
    submissions,
  };
}

export async function getJuryParticipantsQuery(
  db: Database,
  { token }: { token: string },
) {
  const tokenPayload = await verifyJuryToken(token);

  if (!tokenPayload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenPayload.exp < now) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token expired",
    });
  }

  const invitation = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, tokenPayload.invitationId),
    with: {
      competitionClass: true,
      deviceGroup: true,
      topic: true,
    },
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found",
    });
  }

  const marathon = await db.query.marathons.findFirst({
    where: eq(marathons.domain, tokenPayload.domain),
  });

  if (!marathon || invitation.marathonId !== marathon.id) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Marathon not found",
    });
  }

  const invitationExpiry = new Date(invitation.expiresAt);
  if (invitationExpiry < new Date()) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invitation expired",
    });
  }

  const marathonId = marathon.id;

  const conditions = [
    eq(submissions.marathonId, marathonId),
    eq(submissions.status, "uploaded"),
  ];

  if (
    invitation.competitionClassId !== null &&
    invitation.competitionClassId !== undefined
  ) {
    conditions.push(
      eq(participants.competitionClassId, invitation.competitionClassId),
    );
  }

  if (
    invitation.deviceGroupId !== null &&
    invitation.deviceGroupId !== undefined
  ) {
    conditions.push(eq(participants.deviceGroupId, invitation.deviceGroupId));
  }

  if (invitation.topicId !== null && invitation.topicId !== undefined) {
    conditions.push(eq(submissions.topicId, invitation.topicId));
  }

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: {
      participant: {
        with: {
          competitionClass: true,
          deviceGroup: true,
        },
      },
      topic: true,
    },
    orderBy: [desc(submissions.id)],
  });

  // Group submissions by participant and count them
  const participantMap = new Map<
    number,
    {
      id: number;
      reference: string;
      firstname: string;
      lastname: string;
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
      submissionCount: number;
      submissions: Submission[];
    }
  >();

  result.forEach((submission) => {
    if (!submission.previewKey || !submission.participant) return;

    const participantId = submission.participant.id;
    if (!participantMap.has(participantId)) {
      participantMap.set(participantId, {
        id: participantId,
        reference: submission.participant.reference,
        firstname: submission.participant.firstname,
        lastname: submission.participant.lastname,
        competitionClass: submission.participant.competitionClass,
        deviceGroup: submission.participant.deviceGroup,
        submissionCount: 0,
        submissions: [],
      });
    }

    const participant = participantMap.get(participantId);
    if (!participant) {
      throw new Error("Participant not found");
    }
    participant.submissionCount++;
    participant.submissions.push(submission);
  });

  const ratings = await db.query.juryRatings.findMany({
    where: and(
      eq(juryRatings.invitationId, invitation.id),
      eq(juryRatings.marathonId, invitation.marathonId),
    ),
  });

  return {
    participants: Array.from(participantMap.values()),
    invitation,
    ratings,
  };
}

export async function getJuryParticipantSubmissionsQuery(
  db: Database,
  { token, participantId }: { token: string; participantId: number },
) {
  const tokenPayload = await verifyJuryToken(token);

  if (!tokenPayload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenPayload.exp < now) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token expired",
    });
  }

  const invitation = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, tokenPayload.invitationId),
    with: {
      competitionClass: true,
      deviceGroup: true,
      topic: true,
    },
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found",
    });
  }

  const marathon = await db.query.marathons.findFirst({
    where: eq(marathons.domain, tokenPayload.domain),
  });

  if (!marathon || invitation.marathonId !== marathon.id) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Marathon not found",
    });
  }

  const invitationExpiry = new Date(invitation.expiresAt);
  if (invitationExpiry < new Date()) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invitation expired",
    });
  }

  const marathonId = marathon.id;

  const conditions = [
    eq(submissions.marathonId, marathonId),
    eq(submissions.status, "uploaded"),
    eq(submissions.participantId, participantId),
  ];

  if (
    invitation.competitionClassId !== null &&
    invitation.competitionClassId !== undefined
  ) {
    conditions.push(
      eq(participants.competitionClassId, invitation.competitionClassId),
    );
  }

  if (
    invitation.deviceGroupId !== null &&
    invitation.deviceGroupId !== undefined
  ) {
    conditions.push(eq(participants.deviceGroupId, invitation.deviceGroupId));
  }

  if (invitation.topicId !== null && invitation.topicId !== undefined) {
    conditions.push(eq(submissions.topicId, invitation.topicId));
  }

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: {
      participant: {
        with: {
          competitionClass: true,
          deviceGroup: true,
        },
      },
      topic: true,
    },
    orderBy: [desc(submissions.id)],
  });

  // Filter out submissions without preview images
  const validSubmissions = result.filter((submission) => submission.previewKey);

  return {
    submissions: validSubmissions,
    invitation,
  };
}

export async function createJuryRatingMutation(
  db: Database,
  {
    token,
    participantId,
    rating,
    notes,
  }: { token: string; participantId: number; rating: number; notes?: string },
) {
  const tokenPayload = await verifyJuryToken(token);

  if (!tokenPayload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenPayload.exp < now) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token expired",
    });
  }

  const invitation = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, tokenPayload.invitationId),
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found",
    });
  }

  const result = await db
    .insert(juryRatings)
    .values({
      invitationId: tokenPayload.invitationId,
      participantId,
      rating,
      notes: notes || "",
      marathonId: invitation.marathonId,
    })
    .returning({ id: juryRatings.id });

  if (!result[0]?.id) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create jury rating",
    });
  }

  return result[0].id;
}

export async function updateJuryRatingMutation(
  db: Database,
  {
    token,
    participantId,
    rating,
    notes,
  }: { token: string; participantId: number; rating: number; notes?: string },
) {
  const tokenPayload = await verifyJuryToken(token);

  if (!tokenPayload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenPayload.exp < now) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token expired",
    });
  }

  const invitation = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, tokenPayload.invitationId),
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found",
    });
  }

  const result = await db
    .update(juryRatings)
    .set({
      rating,
      notes: notes || "",
    })
    .where(
      and(
        eq(juryRatings.invitationId, tokenPayload.invitationId),
        eq(juryRatings.participantId, participantId),
      ),
    )
    .returning({ id: juryRatings.id });

  return result[0]?.id ?? null;
}

export async function getJuryRatingQuery(
  db: Database,
  { token, participantId }: { token: string; participantId: number },
) {
  const tokenPayload = await verifyJuryToken(token);

  if (!tokenPayload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenPayload.exp < now) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token expired",
    });
  }

  const invitation = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, tokenPayload.invitationId),
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found",
    });
  }

  const result = await db.query.juryRatings.findFirst({
    where: and(
      eq(juryRatings.invitationId, tokenPayload.invitationId),
      eq(juryRatings.participantId, participantId),
    ),
  });

  return result ?? null;
}

export async function deleteJuryRatingMutation(
  db: Database,
  { token, participantId }: { token: string; participantId: number },
) {
  const tokenPayload = await verifyJuryToken(token);

  if (!tokenPayload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenPayload.exp < now) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token expired",
    });
  }

  const invitation = await db.query.juryInvitations.findFirst({
    where: eq(juryInvitations.id, tokenPayload.invitationId),
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invitation not found",
    });
  }

  const result = await db
    .delete(juryRatings)
    .where(
      and(
        eq(juryRatings.invitationId, tokenPayload.invitationId),
        eq(juryRatings.participantId, participantId),
      ),
    )
    .returning({ id: juryRatings.id });

  return result[0]?.id ?? null;
}
