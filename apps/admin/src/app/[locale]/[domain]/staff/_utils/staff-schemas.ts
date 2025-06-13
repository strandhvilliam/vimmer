import { z } from "zod";

export const addStaffMemberSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["staff", "admin"]),
});
