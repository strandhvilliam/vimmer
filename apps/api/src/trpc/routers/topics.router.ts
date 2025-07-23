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
} from "@vimmer/api/schemas/topics.schemas";
import {
  createTopicQuery,
  deleteTopicQuery,
  getTopicByIdQuery,
  getTopicsByDomainQuery,
  getTopicsByMarathonIdQuery,
  updateTopicQuery,
  updateTopicsOrder,
  getTopicsWithSubmissionCountQuery,
  getTotalSubmissionCountQuery,
  getScheduledTopicsQuery,
} from "@vimmer/api/db/queries/topics.queries";
import { TRPCError } from "@trpc/server";

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
      const { id, data } = input;

      // If orderIndex is being updated, we need to handle reordering
      if (data.orderIndex !== undefined) {
        const currentTopic = await getTopicByIdQuery(ctx.db, { id });
        if (!currentTopic) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Topic not found",
          });
        }

        const allTopics = await getTopicsByMarathonIdQuery(ctx.db, {
          id: currentTopic.marathonId,
        });
        const currentOrderIndex = currentTopic.orderIndex;
        const newOrderIndex = data.orderIndex;

        // Update the topic first
        const result = await updateTopicQuery(ctx.db, { id, data });

        // Only reorder if the position actually changed
        if (currentOrderIndex !== newOrderIndex) {
          // Create new ordering array
          const topicsWithoutCurrent = allTopics.filter(
            (topic) => topic.id !== id,
          );
          const newOrdering: number[] = [];

          // Insert topics in their new positions
          for (let i = 0; i <= topicsWithoutCurrent.length; i++) {
            if (i === newOrderIndex) {
              newOrdering.push(id);
            }

            const topicAtPosition = topicsWithoutCurrent.find(
              (topic) => topic.orderIndex === (i < newOrderIndex ? i : i + 1),
            );

            if (topicAtPosition) {
              newOrdering.push(topicAtPosition.id);
            }
          }

          await updateTopicsOrder(ctx.supabase, {
            topicIds: newOrdering,
            marathonId: currentTopic.marathonId,
          });
        }

        return result;
      }

      // If no orderIndex change, just update normally
      return updateTopicQuery(ctx.db, { id, data });
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
      const { data } = input;
      const { orderIndex = -1, marathonId } = data;

      // Get all existing topics for this marathon
      const existingTopics = await getTopicsByMarathonIdQuery(ctx.db, {
        id: marathonId,
      });

      // Determine the actual order index
      // If orderIndex is -1, place at the end (existingTopics.length)
      // Otherwise, clamp to valid range [0, existingTopics.length]
      const actualOrderIndex =
        orderIndex === -1
          ? existingTopics.length
          : Math.min(Math.max(orderIndex, 0), existingTopics.length);

      // Create the topic with a temporary order index
      const result = await createTopicQuery(ctx.db, {
        data: {
          ...data,
          orderIndex: -1, // Temporary value
        },
      });

      const createdTopicId = result.id;
      if (!createdTopicId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create topic",
        });
      }

      // Create new ordering array
      const newOrdering: number[] = [];

      // Insert the new topic at the specified position
      for (let i = 0; i <= existingTopics.length; i++) {
        if (i === actualOrderIndex) {
          newOrdering.push(createdTopicId);
        }

        if (i < existingTopics.length) {
          const existingTopic = existingTopics.find(
            (topic) => topic.orderIndex === i,
          );
          if (existingTopic) {
            newOrdering.push(existingTopic.id);
          }
        }
      }

      // Update the order of all topics
      try {
        await updateTopicsOrder(ctx.supabase, {
          topicIds: newOrdering,
          marathonId,
        });
      } catch (error) {
        // If reordering fails, delete the created topic to maintain consistency
        await deleteTopicQuery(ctx.db, { id: createdTopicId });
        throw error;
      }

      return { id: createdTopicId };
    }),
  delete: publicProcedure
    .input(deleteTopicSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, marathonId } = input;

      const allTopics = await getTopicsByMarathonIdQuery(ctx.db, {
        id: marathonId,
      });

      const topicToDelete = allTopics.find((topic) => topic.id === id);
      if (!topicToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found",
        });
      }

      // Delete the topic
      const result = await deleteTopicQuery(ctx.db, { id });

      // Get remaining topics and reorder them
      const remainingTopics = allTopics
        .filter((topic) => topic.id !== id)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      if (remainingTopics.length > 0) {
        const topicIds = remainingTopics.map((topic) => topic.id);
        await updateTopicsOrder(ctx.supabase, { topicIds, marathonId });
      }

      return result;
    }),

  getWithSubmissionCount: publicProcedure
    .input(getTopicsWithSubmissionCountSchema)
    .query(async ({ ctx, input }) => {
      return getTopicsWithSubmissionCountQuery(ctx.db, {
        domain: input.domain,
      });
    }),

  getTotalSubmissionCount: publicProcedure
    .input(getTotalSubmissionCountSchema)
    .query(async ({ ctx, input }) => {
      return getTotalSubmissionCountQuery(ctx.db, {
        marathonId: input.marathonId,
      });
    }),

  getScheduled: publicProcedure
    .input(getScheduledTopicsSchema)
    .query(async ({ ctx, input }) => {
      return getScheduledTopicsQuery(ctx.db);
    }),
});
