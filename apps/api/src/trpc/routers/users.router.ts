import {
  createUserMutation,
  deleteUserMutation,
  getMarathonsByUserIdQuery,
  getStaffMemberByIdQuery,
  getStaffMembersByDomainQuery,
  getUserByEmailWithMarathonsQuery,
  getUserWithMarathonsQuery,
  updateUserMutation,
  createUserMarathonRelationMutation,
  updateUserMarathonRelationMutation,
  deleteUserMarathonRelationMutation,
} from "@vimmer/api/db/queries/users.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  createUserSchema,
  deleteUserSchema,
  getMarathonsByUserIdSchema,
  getStaffMemberByIdSchema,
  getStaffMembersByDomainSchema,
  getUserByEmailWithMarathonsSchema,
  getUserWithMarathonsSchema,
  updateUserSchema,
  createUserMarathonRelationSchema,
  updateUserMarathonRelationSchema,
  deleteUserMarathonRelationSchema,
} from "@vimmer/api/schemas/users.schemas";

export const usersRouter = createTRPCRouter({
  getUserWithMarathons: publicProcedure
    .input(getUserWithMarathonsSchema)
    .query(async ({ ctx, input }) => {
      return getUserWithMarathonsQuery(ctx.db, {
        userId: input.userId,
      });
    }),

  getMarathonsByUserId: publicProcedure
    .input(getMarathonsByUserIdSchema)
    .query(async ({ ctx, input }) => {
      return getMarathonsByUserIdQuery(ctx.db, {
        userId: input.userId,
      });
    }),

  getUserByEmailWithMarathons: publicProcedure
    .input(getUserByEmailWithMarathonsSchema)
    .query(async ({ ctx, input }) => {
      return getUserByEmailWithMarathonsQuery(ctx.db, {
        email: input.email,
      });
    }),

  getStaffMembersByDomain: publicProcedure
    .input(getStaffMembersByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getStaffMembersByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),

  getStaffMemberById: publicProcedure
    .input(getStaffMemberByIdSchema)
    .query(async ({ ctx, input }) => {
      return getStaffMemberByIdQuery(ctx.db, {
        staffId: input.staffId,
        marathonId: input.marathonId,
      });
    }),

  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      return createUserMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateUser: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      return updateUserMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  deleteUser: publicProcedure
    .input(deleteUserSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteUserMutation(ctx.db, {
        id: input.id,
      });
    }),

  createUserMarathonRelation: publicProcedure
    .input(createUserMarathonRelationSchema)
    .mutation(async ({ ctx, input }) => {
      return createUserMarathonRelationMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateUserMarathonRelation: publicProcedure
    .input(updateUserMarathonRelationSchema)
    .mutation(async ({ ctx, input }) => {
      return updateUserMarathonRelationMutation(ctx.db, {
        userId: input.userId,
        marathonId: input.marathonId,
        data: input.data,
      });
    }),

  deleteUserMarathonRelation: publicProcedure
    .input(deleteUserMarathonRelationSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteUserMarathonRelationMutation(ctx.db, {
        userId: input.userId,
        marathonId: input.marathonId,
      });
    }),
});
