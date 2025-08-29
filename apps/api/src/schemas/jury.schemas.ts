import { z } from "zod/v4";

export const getJurySubmissionsSchema = z.object({
  domain: z.string(),
  competitionClassId: z.number().optional(),
  deviceGroupId: z.number().optional(),
  topicId: z.number().optional(),
});

export const getJuryInvitationsByMarathonIdSchema = z.object({
  id: z.number(),
});

export const getJuryInvitationsByDomainSchema = z.object({
  domain: z.string(),
});

export const getJuryInvitationByIdSchema = z.object({
  id: z.number(),
});

export const createJuryInvitationSchema = z.object({
  data: z.object({
    domain: z.string(),
    status: z.string().optional(),
    token: z.string(),
    expiresAt: z.string(),
    email: z.string(),
    displayName: z.string(),
    marathonId: z.number(),
    topicId: z.number().optional(),
    competitionClassId: z.number().optional(),
    deviceGroupId: z.number().optional(),
    notes: z.string().optional(),
  }),
});

export const updateJuryInvitationSchema = z.object({
  id: z.number(),
  data: z.object({
    status: z.string().optional(),
    token: z.string().optional(),
    expiresAt: z.string().optional(),
    email: z.string().optional(),
    displayName: z.string().optional(),
    marathonId: z.number().optional(),
    topicId: z.number().optional(),
    competitionClassId: z.number().optional(),
    deviceGroupId: z.number().optional(),
    notes: z.string().optional(),
  }),
});

export const deleteJuryInvitationSchema = z.object({
  id: z.number(),
});

export const verifyJuryTokenSchema = z.object({
  token: z.string(),
});

export const getJurySubmissionsFromTokenSchema = z.object({
  token: z.string(),
  cursor: z.number().optional(),
  ratingFilter: z.array(z.number().min(0).max(5)).optional(),
});

export const getJuryTopicParticipantsSchema = z.object({
  token: z.string(),
  topicId: z.number(),
});

export const getJuryParticipantsSchema = z.object({
  token: z.string(),
});

export const getJuryParticipantCountSchema = z.object({
  token: z.string(),
  ratingFilter: z.array(z.number().min(0).max(5)).optional(),
});

export const getJuryRatingsByInvitationSchema = z.object({
  token: z.string(),
});

export const getJuryParticipantSubmissionsSchema = z.object({
  token: z.string(),
  participantId: z.number(),
});

export const createJuryRatingSchema = z.object({
  token: z.string(),
  participantId: z.number(),
  rating: z.number().min(0).max(5),
  notes: z.string().optional(),
});

export const updateJuryRatingSchema = z.object({
  token: z.string(),
  participantId: z.number(),
  rating: z.number().min(0).max(5),
  notes: z.string().optional(),
  finalRanking: z.number().optional(),
});

export const getJuryRatingSchema = z.object({
  token: z.string(),
  participantId: z.number(),
});

export const deleteJuryRatingSchema = z.object({
  token: z.string(),
  participantId: z.number(),
});
