import { z } from "zod/v4";

export const getDeviceGroupByIdSchema = z.object({
  id: z.number(),
});

export const getDeviceGroupsByDomainSchema = z.object({
  domain: z.string(),
});

export const createDeviceGroupSchema = z.object({
  data: z.object({
    name: z.string(),
    marathonId: z.number(),
    icon: z.string().default("camera"),
    description: z.string().optional(),
  }),
});

export const updateDeviceGroupSchema = z.object({
  id: z.number(),
  data: z.object({
    name: z.string().optional(),
    icon: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const deleteDeviceGroupSchema = z.object({
  id: z.number(),
});
