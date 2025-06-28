import {
  getValidationResultsByParticipantIdQuery,
  getParticipantVerificationsByStaffIdQuery,
  createValidationResultMutation,
  createMultipleValidationResultsMutation,
  updateValidationResultMutation,
  createParticipantVerificationMutation,
} from "@vimmer/api/db/queries/validations.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  getValidationResultsByParticipantIdSchema,
  getParticipantVerificationsByStaffIdSchema,
  createValidationResultSchema,
  createMultipleValidationResultsSchema,
  updateValidationResultSchema,
  createParticipantVerificationSchema,
} from "@vimmer/api/schemas/validations.schemas";

export const validationsRouter = createTRPCRouter({
  getValidationResultsByParticipantId: publicProcedure
    .input(getValidationResultsByParticipantIdSchema)
    .query(async ({ ctx, input }) => {
      return getValidationResultsByParticipantIdQuery(ctx.db, {
        participantId: input.participantId,
      });
    }),

  getParticipantVerificationsByStaffId: publicProcedure
    .input(getParticipantVerificationsByStaffIdSchema)
    .query(async ({ ctx, input }) => {
      return getParticipantVerificationsByStaffIdQuery(ctx.db, {
        staffId: input.staffId,
      });
    }),

  createValidationResult: publicProcedure
    .input(createValidationResultSchema)
    .mutation(async ({ ctx, input }) => {
      return createValidationResultMutation(ctx.db, {
        data: input.data,
      });
    }),

  createMultipleValidationResults: publicProcedure
    .input(createMultipleValidationResultsSchema)
    .mutation(async ({ ctx, input }) => {
      return createMultipleValidationResultsMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateValidationResult: publicProcedure
    .input(updateValidationResultSchema)
    .mutation(async ({ ctx, input }) => {
      return updateValidationResultMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  createParticipantVerification: publicProcedure
    .input(createParticipantVerificationSchema)
    .mutation(async ({ ctx, input }) => {
      return createParticipantVerificationMutation(ctx.db, {
        data: input.data,
      });
    }),
});
