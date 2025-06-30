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
  getUserByIdQuery,
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
  createStaffMemberSchema,
} from "@vimmer/api/schemas/users.schemas";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";

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
        domain: input.domain,
      });
    }),

  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      return createUserMutation(ctx.db, {
        data: input.data,
      });
    }),

  createStaffMember: publicProcedure
    .input(createStaffMemberSchema)
    .mutation(async ({ ctx, input }) => {
      let user = await getUserByEmailWithMarathonsQuery(ctx.db, {
        email: input.data.email,
      });

      if (!user) {
        const { id } = await createUserMutation(ctx.db, {
          data: {
            id: crypto.randomUUID(),
            email: input.data.email,
            name: input.data.name,
            emailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });

        if (!id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        const newUser = await getUserByIdQuery(ctx.db, {
          id,
        });

        if (!newUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get user",
          });
        }

        user = { ...newUser, userMarathons: [] };
      }

      await createUserMarathonRelationMutation(ctx.db, {
        data: {
          userId: user.id,
          marathonId: input.data.marathonId,
        },
      });

      return user;
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
