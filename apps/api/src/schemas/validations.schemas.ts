import { z } from "zod/v4";

export const getValidationResultsByParticipantIdSchema = z.object({
  participantId: z.number(),
});

export const getParticipantVerificationsByStaffIdSchema = z.object({
  staffId: z.string(),
});

export const createValidationResultSchema = z.object({
  data: z.object({
    outcome: z.string(),
    ruleKey: z.string(),
    message: z.string(),
    fileName: z.string().optional(),
    severity: z.string(),
    participantId: z.number(),
    overruled: z.boolean().default(false),
  }),
});

export const createMultipleValidationResultsSchema = z.object({
  data: z.array(
    z.object({
      outcome: z.string(),
      ruleKey: z.string(),
      message: z.string(),
      fileName: z.string().optional(),
      severity: z.string(),
      participantId: z.number(),
      overruled: z.boolean().default(false),
    })
  ),
});

export const updateValidationResultSchema = z.object({
  id: z.number(),
  data: z.object({
    outcome: z.string().optional(),
    ruleKey: z.string().optional(),
    message: z.string().optional(),
    fileName: z.string().optional(),
    severity: z.string().optional(),
    participantId: z.number().optional(),
    overruled: z.boolean().optional(),
  }),
});

export const createParticipantVerificationSchema = z.object({
  data: z.object({
    participantId: z.number(),
    staffId: z.string(),
    notes: z.string().optional(),
  }),
});

export const runValidationsSchema = z.object({
  participantId: z.number(),
});

export const verifyParticipantSchema = z.object({
  data: z.object({
    staffId: z.string(),
    participantId: z.number(),
    notes: z.string().optional(),
  }),
});
