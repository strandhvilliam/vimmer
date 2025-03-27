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
  firstname: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastname: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  marathonId: z.number().min(1, "Invalid marathon ID"),
  domain: z.string().min(1, "Invalid domain"),
});
