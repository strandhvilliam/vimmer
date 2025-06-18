import { z } from "zod/v4";

export const getCompetitionClassByIdSchema = z.object({
  id: z.number(),
});

export const getCompetitionClassesByDomainSchema = z.object({
  domain: z.string(),
});

export const createCompetitionClassSchema = z.object({
  data: z.object({
    name: z.string(),
    numberOfPhotos: z.number(),
    marathonId: z.number(),
    topicStartIndex: z.number().default(0),
    description: z.string().optional(),
  }),
});

export const updateCompetitionClassSchema = z.object({
  id: z.number(),
  data: z.object({
    name: z.string().optional(),
    numberOfPhotos: z.number().optional(),
    topicStartIndex: z.number().optional(),
    description: z.string().optional(),
  }),
});

export const deleteCompetitionClassSchema = z.object({
  id: z.number(),
});
