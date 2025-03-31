import { z } from "zod";

export const updateParticipantDetailsSchema = z.object({
  participantRef: z.string().min(1, "Invalid participant reference"),
  domain: z.string().min(1, "Invalid domain"),
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
});

export type UpdateParticipantDetailsSchema = z.infer<
  typeof updateParticipantDetailsSchema
>;
