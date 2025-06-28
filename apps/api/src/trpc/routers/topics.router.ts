import { createTRPCRouter, publicProcedure } from "..";
import {
  createTopicSchema,
  deleteTopicSchema,
  getTopicByIdSchema,
  getTopicsByDomainSchema,
  getTopicsByMarathonIdSchema,
  updateTopicSchema,
  updateTopicsOrderSchema,
  getTopicsWithSubmissionCountSchema,
  getTotalSubmissionCountSchema,
  getScheduledTopicsSchema,
} from "@api/schemas/topics.schemas";
import {
  createTopic,
  deleteTopic,
  getTopicByIdQuery,
  getTopicsByDomainQuery,
  getTopicsByMarathonIdQuery,
  updateTopic,
  updateTopicsOrder,
  getTopicsWithSubmissionCountQuery,
  getTotalSubmissionCountQuery,
  getScheduledTopicsQuery,
} from "@api/db/queries/topics.queries";

export const topicsRouter = createTRPCRouter({
  getByMarathonId: publicProcedure
    .input(getTopicsByMarathonIdSchema)
    .query(async ({ ctx, input }) => {
      return getTopicsByMarathonIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getByDomain: publicProcedure
    .input(getTopicsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getTopicsByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),
  getById: publicProcedure
    .input(getTopicByIdSchema)
    .query(async ({ ctx, input }) => {
      return getTopicByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  update: publicProcedure
    .input(updateTopicSchema)
    .mutation(async ({ ctx, input }) => {
      return updateTopic(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),
  updateOrder: publicProcedure
    .input(updateTopicsOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return updateTopicsOrder(ctx.supabase, {
        topicIds: input.topicIds,
        marathonId: input.marathonId,
      });
    }),
  create: publicProcedure
    .input(createTopicSchema)
    .mutation(async ({ ctx, input }) => {
      return createTopic(ctx.db, {
        data: input.data,
      });
    }),
  delete: publicProcedure
    .input(deleteTopicSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteTopic(ctx.db, {
        id: input.id,
      });
    }),

  getWithSubmissionCount: publicProcedure
    .input(getTopicsWithSubmissionCountSchema)
    .query(async ({ ctx, input }) => {
      return getTopicsWithSubmissionCountQuery(ctx.supabase, {
        marathonId: input.marathonId,
      });
    }),

  getTotalSubmissionCount: publicProcedure
    .input(getTotalSubmissionCountSchema)
    .query(async ({ ctx, input }) => {
      return getTotalSubmissionCountQuery(ctx.supabase, {
        marathonId: input.marathonId,
      });
    }),

  getScheduled: publicProcedure
    .input(getScheduledTopicsSchema)
    .query(async ({ ctx, input }) => {
      return getScheduledTopicsQuery(ctx.db);
    }),
});
