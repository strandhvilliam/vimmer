import { z } from "zod/v4";

export const getMarathonByIdSchema = z.object({
  id: z.number(),
});

export const getMarathonByDomainSchema = z.object({
  domain: z.string(),
});

export const createMarathonSchema = z.object({
  data: z.object({
    domain: z.string(),
    name: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    logoUrl: z.string().optional(),
    description: z.string().optional(),
    languages: z.string().default("en"),
    setupCompleted: z.boolean().default(false).optional(),
  }),
});

export const updateMarathonSchema = z.object({
  id: z.number(),
  data: z.object({
    domain: z.string().optional(),
    name: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    logoUrl: z.string().optional(),
    description: z.string().optional(),
    languages: z.string().optional(),
    setupCompleted: z.boolean().optional(),
  }),
});

export const deleteMarathonSchema = z.object({
  id: z.number(),
});
