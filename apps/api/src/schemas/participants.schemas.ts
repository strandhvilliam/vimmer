import { z } from "zod/v4";

export const getParticipantsByDomainSchema = z.object({
  domain: z.string(),
});

export const getParticipantsWithoutSubmissionsSchema = z.object({
  domain: z.string(),
});

export const getParticipantsByDomainPaginatedSchema = z.object({
  domain: z.string(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  competitionClassId: z.union([z.number(), z.array(z.number())]).optional(),
  deviceGroupId: z.union([z.number(), z.array(z.number())]).optional(),
  sortBy: z
    .enum(["createdAt", "reference", "firstname", "lastname", "uploadCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const getParticipantByIdSchema = z.object({
  id: z.number(),
});

export const getParticipantByReferenceSchema = z.object({
  reference: z.string(),
  domain: z.string(),
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

export const incrementUploadCounterSchema = z.object({
  participantId: z.number(),
  totalExpected: z.number(),
});
