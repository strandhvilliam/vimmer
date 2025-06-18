import { createTRPCRouter, publicProcedure } from "../init";
import {
  createTopicSchema,
  deleteTopicSchema,
  getTopicByIdSchema,
  getTopicsByDomainSchema,
  getTopicsByMarathonIdSchema,
  updateTopicSchema,
  updateTopicsOrderSchema,
} from "@/schemas/topics.schemas";
import {
  createTopic,
  deleteTopic,
  getTopicByIdQuery,
  getTopicsByDomainQuery,
  getTopicsByMarathonIdQuery,
  updateTopic,
  updateTopicsOrder,
} from "@/db/queries/topics.queries";

export const topicsRouter = createTRPCRouter({
  getTopicsByMarathonId: publicProcedure
    .input(getTopicsByMarathonIdSchema)
    .query(async ({ ctx, input }) => {
      return getTopicsByMarathonIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getTopicsByDomain: publicProcedure
    .input(getTopicsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getTopicsByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),
  getTopicById: publicProcedure
    .input(getTopicByIdSchema)
    .query(async ({ ctx, input }) => {
      return getTopicByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  updateTopic: publicProcedure
    .input(updateTopicSchema)
    .mutation(async ({ ctx, input }) => {
      return updateTopic(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),
  updateTopicsOrder: publicProcedure
    .input(updateTopicsOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return updateTopicsOrder(ctx.supabase, {
        topicIds: input.topicIds,
        marathonId: input.marathonId,
      });
    }),
  createTopic: publicProcedure
    .input(createTopicSchema)
    .mutation(async ({ ctx, input }) => {
      return createTopic(ctx.db, {
        data: input.data,
      });
    }),
  deleteTopic: publicProcedure
    .input(deleteTopicSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteTopic(ctx.db, {
        id: input.id,
      });
    }),
});
