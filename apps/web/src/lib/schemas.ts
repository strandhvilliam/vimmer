import { z } from "zod";

export const createDeviceGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
});

export const editDeviceGroupSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
});

export const createCompetitionClassSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  numberOfPhotos: z.coerce
    .number()
    .min(1, {
      message: "Must have at least 1 photo.",
    })
    .max(50, {
      message: "Cannot exceed 50 photos.",
    }),
  topicStartIndex: z.coerce
    .number()
    .min(0, {
      message: "Topic start index must be 0 or greater.",
    })
    .default(0),
});

export const editCompetitionClassSchema = z.object({
  id: z.number(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  numberOfPhotos: z.coerce
    .number()
    .min(1, {
      message: "Must have at least 1 photo.",
    })
    .max(50, {
      message: "Cannot exceed 50 photos.",
    }),
  topicStartIndex: z.coerce
    .number()
    .min(0, {
      message: "Topic start index must be 0 or greater.",
    })
    .default(0),
});

export type CreateDeviceGroupInput = z.infer<typeof createDeviceGroupSchema>;
export type EditDeviceGroupInput = z.infer<typeof editDeviceGroupSchema>;
export type CreateCompetitionClassInput = z.infer<
  typeof createCompetitionClassSchema
>;
export type EditCompetitionClassInput = z.infer<
  typeof editCompetitionClassSchema
>;
