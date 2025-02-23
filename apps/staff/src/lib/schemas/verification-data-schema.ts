import { z } from "zod";

export const verificationDataSchema = z.object({
  reference: z.string().min(1, "Invalid participant reference"),
  domain: z.string().min(1, "Invalid marathon domain"),
});

export type QrDataArgs = z.infer<typeof verificationDataSchema>;
