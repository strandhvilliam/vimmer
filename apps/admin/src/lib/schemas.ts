import { z } from "zod";

export const createDeviceGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
});

export type CreateDeviceGroupInput = z.infer<typeof createDeviceGroupSchema>;
