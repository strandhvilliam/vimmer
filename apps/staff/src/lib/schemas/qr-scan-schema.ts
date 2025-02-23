import { z } from "zod";
export const qrScanSchema = z
  .string()
  .regex(/^domain=[A-Za-z0-9_]+;reference=[A-Za-z0-9_]+$/, {
    message:
      "Invalid format. Expected format: domain=VAL1;reference=VAL2, where keys/values are alphanumeric or underscores.",
  })
  .transform((data) => {
    const pairs = data.split(";");
    const result = pairs.reduce<Record<string, string>>((acc, pair) => {
      const [key, value] = pair.split("=") as [string, string];
      acc[key] = value;
      return acc;
    }, {});
    return result as { domain: string; reference: string };
  })
  .refine((data) => {
    if (!data.domain || !data.reference) {
      return false;
    }
    return true;
  });
