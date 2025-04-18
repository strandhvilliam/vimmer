import { z } from "zod";

export const presignedSubmissionQuerySchema = z.object({
  participantRef: z.string().min(1),
  domain: z.string().min(1),
  participantId: z.string().min(1),
  competitionClassId: z.string().min(1),
});

export type PresignedSubmissionQuery = z.infer<
  typeof presignedSubmissionQuerySchema
>;

export interface ErrorResponse {
  error: string;
}
