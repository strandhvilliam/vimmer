import { z } from "zod/v4";

export const getUserWithMarathonsSchema = z.object({
  userId: z.string(),
});

export const getMarathonsByUserIdSchema = z.object({
  userId: z.string(),
});

export const getUserByEmailWithMarathonsSchema = z.object({
  email: z.string().email(),
});

export const getStaffMembersByDomainSchema = z.object({
  domain: z.string(),
});

export const getStaffMemberByIdSchema = z.object({
  staffId: z.string(),
  domain: z.string(),
});

export const createUserSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    image: z.string().optional(),
    banned: z.boolean().optional(),
    banReason: z.string().optional(),
    banExpires: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  id: z.string(),
  data: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    emailVerified: z.boolean().optional(),
    image: z.string().optional(),
    banned: z.boolean().optional(),
    banReason: z.string().optional(),
    banExpires: z.string().optional(),
  }),
});

export const deleteUserSchema = z.object({
  id: z.string(),
});

export const createUserMarathonRelationSchema = z.object({
  data: z.object({
    marathonId: z.number(),
    role: z.string().default("staff"),
    userId: z.string(),
  }),
});

export const updateUserMarathonRelationSchema = z.object({
  userId: z.string(),
  marathonId: z.number(),
  data: z.object({
    role: z.string(),
  }),
});

export const deleteUserMarathonRelationSchema = z.object({
  userId: z.string(),
  marathonId: z.number(),
});
