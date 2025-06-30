import { z } from "zod/v4";

export const getTopicsByMarathonIdSchema = z.object({
  id: z.number(),
});

export const getTopicsByDomainSchema = z.object({
  domain: z.string(),
});

export const getTopicByIdSchema = z.object({
  id: z.number(),
});

export const createTopicSchema = z.object({
  data: z.object({
    name: z.string(),
    marathonId: z.number(),
    orderIndex: z.number().default(0),
    visibility: z.string().default("private"),
    scheduledStart: z.string().optional(),
  }),
});

export const updateTopicSchema = z.object({
  id: z.number(),
  data: z.object({
    name: z.string().optional(),
    orderIndex: z.number().optional(),
    visibility: z.string().optional(),
    scheduledStart: z.string().optional(),
  }),
});

export const updateTopicsOrderSchema = z.object({
  topicIds: z.array(z.number()),
  marathonId: z.number(),
});

export const deleteTopicSchema = z.object({
  id: z.number(),
  marathonId: z.number(),
});

export const getTopicsWithSubmissionCountSchema = z.object({
  domain: z.string(),
});

export const getTotalSubmissionCountSchema = z.object({
  marathonId: z.number(),
});

export const getScheduledTopicsSchema = z.object({});
