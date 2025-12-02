import { createTRPCRouter, publicProcedure } from "..";
import {
  createMarathonSchema,
  deleteMarathonSchema,
  getMarathonByIdSchema,
  getMarathonByDomainSchema,
  resetMarathonSchema,
  updateMarathonSchema,
  updateMarathonByDomainSchema,
} from "@vimmer/api/schemas/marathons.schemas";
import {
  createMarathonMutation,
  deleteMarathonMutation,
  getMarathonByIdQuery,
  getMarathonByDomainQuery,
  resetMarathonMutation,
  updateMarathonMutation,
  updateMarathonByDomainMutation,
} from "@vimmer/api/db/queries/marathons.queries";
import { updateRuleConfigSchema } from "@vimmer/api/schemas/rules.schemas";
import {
  getRulesByDomainQuery,
  updateRuleConfigMutation,
} from "@vimmer/api/db/queries/rules.queries";
import { RULE_KEYS } from "../../../../../packages/validation/old/constants";
import { TRPCError } from "@trpc/server";
import { resetS3Uploads } from "@vimmer/api/utils/reset-s3-uploads";
import { eq } from "drizzle-orm";
import { participants } from "@vimmer/api/db/schema";
import { invalidateCloudfrontByDomain } from "@vimmer/api/utils/invalidate-cloudfront-domain";

export const marathonsRouter = createTRPCRouter({
  hello: publicProcedure.query(async ({ ctx }) => {
    return "hello";
  }),
  getById: publicProcedure
    .input(getMarathonByIdSchema)
    .query(async ({ ctx, input }) => {
      return await getMarathonByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getByDomain: publicProcedure
    .input(getMarathonByDomainSchema)
    .query(async ({ ctx, input }) => {
      const data = await getMarathonByDomainQuery(ctx.db, {
        domain: input.domain,
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Marathon not found for domain ${input.domain}`,
        });
      }

      return data;
    }),
  create: publicProcedure
    .input(createMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      return await createMarathonMutation(ctx.db, {
        data: input.data,
      });
    }),
  update: publicProcedure
    .input(updateMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await updateMarathonMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });

      if (input.data.startDate || input.data.endDate) {
        const rules = await getRulesByDomainQuery(ctx.db, {
          domain: input.domain,
        });

        const withinTimerangeRule = rules.find(
          (rule) => rule.ruleKey === RULE_KEYS.WITHIN_TIMERANGE,
        );

        if (withinTimerangeRule) {
          await updateRuleConfigMutation(ctx.db, {
            id: withinTimerangeRule.id,
            data: {
              params: {
                start: input.data.startDate,
                end: input.data.endDate,
              },
            },
          });
        }
      }

      return result;
    }),

  updateByDomain: publicProcedure
    .input(updateMarathonByDomainSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateMarathonByDomainMutation(ctx.db, {
        domain: input.domain,
        data: input.data,
      });
    }),
  delete: publicProcedure
    .input(deleteMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      return await deleteMarathonMutation(ctx.db, {
        id: input.id,
      });
    }),
  reset: publicProcedure
    .input(resetMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      const marathon = await getMarathonByIdQuery(ctx.db, {
        id: input.id,
      });

      if (!marathon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Marathon not found for id ${input.id}`,
        });
      }

      const allParticipants = await ctx.db.query.participants.findMany({
        where: eq(participants.marathonId, input.id),
        with: {
          submissions: true,
        },
      });

      const keysToRemove = allParticipants.flatMap((participant) =>
        participant.submissions.map((submission) => ({
          submissionKey: submission.key,
          thumbnailKey: submission.thumbnailKey,
          previewKey: submission.previewKey,
        })),
      );

      await resetMarathonMutation(ctx.db, {
        id: input.id,
      });
      await resetS3Uploads(keysToRemove);
      await invalidateCloudfrontByDomain(marathon.domain);
    }),
});
