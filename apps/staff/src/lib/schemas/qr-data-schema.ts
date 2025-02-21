import { z } from "zod";

export const qrDataSchema = z.object({
  pid: z
    .number()
    .int("Invalid PID")
    .positive("Invalid PID")
    .min(1, "Invalid PID"),
});
