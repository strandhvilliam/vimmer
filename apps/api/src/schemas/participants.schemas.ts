import { z } from "zod/v4";

export const getParticipantsByDomainSchema = z.object({
  domain: z.string(),
});

export const getParticipantByIdSchema = z.object({
  id: z.number(),
});

export const createParticipantSchema = z.object({
  data: z.object({
    reference: z.string(),
    email: z.email().optional(),
    marathonId: z.number(),
    competitionClassId: z.number().optional(),
    deviceGroupId: z.number().optional(),
    domain: z.string().default(""),
    firstname: z.string().default(""),
    lastname: z.string().default(""),
    status: z.string().default("initialized"),
  }),
});

export const updateParticipantSchema = z.object({
  id: z.number(),
  data: z.object({
    reference: z.string().optional(),
    email: z.email().optional(),
    competitionClassId: z.number().optional(),
    deviceGroupId: z.number().optional(),
    domain: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    status: z.string().optional(),
    uploadCount: z.number().optional(),
  }),
});

export const deleteParticipantSchema = z.object({
  id: z.number(),
});
