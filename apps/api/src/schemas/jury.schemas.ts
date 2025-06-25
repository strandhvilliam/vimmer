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

export const getJuryInvitationByIdSchema = z.object({
  id: z.number(),
});

export const createJuryInvitationSchema = z.object({
  data: z.object({
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
