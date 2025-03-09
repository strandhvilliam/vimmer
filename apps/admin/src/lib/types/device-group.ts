import { z } from "zod";
import { Icons } from "@/components/icons";

export const deviceGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.enum(Object.keys(Icons) as [string, ...string[]], {
    required_error: "Please select an icon",
  }),
  allowedDevices: z
    .array(z.string())
    .min(1, "At least one device must be specified"),
});

export type DeviceGroup = z.infer<typeof deviceGroupSchema>;

// Common device types that can be used as suggestions
export const commonDeviceTypes = [
  "DSLR",
  "Mirrorless",
  "Smartphone",
  "Point and Shoot",
  "Film Camera",
  "Action Camera",
  "Drone",
  "Medium Format",
  "Large Format",
] as const;
