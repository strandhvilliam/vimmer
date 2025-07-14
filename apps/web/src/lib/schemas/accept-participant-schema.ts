import { z } from "zod";

export const acceptParticipantSchema = z.object({
  pid: z.number().int().positive(),
});
