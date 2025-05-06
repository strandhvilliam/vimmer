import { z } from "zod";

export const initializeParticipantSchema = z.object({
  participantRef: z
    .string()
    .nonempty({ message: "Participant reference is required." })
    .refine((val) => /^\d+$/.test(val), {
      message: "Only numbers are allowed.",
    })
    .refine((val) => val.length === 4, {
      message: `Must be exactly ${4} digits.`,
    }),
  marathonId: z.number().min(1, "Invalid marathon ID"),
  domain: z.string().min(1, "Invalid domain"),
});

export type InitializeParticipantSchema = z.infer<
  typeof initializeParticipantSchema
>;
