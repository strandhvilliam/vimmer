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
