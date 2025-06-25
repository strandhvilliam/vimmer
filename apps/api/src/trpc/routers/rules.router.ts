import {
  createRuleConfigMutation,
  deleteRuleConfigByMarathonIdAndRuleKeyMutation,
  deleteRuleConfigMutation,
  getRuleConfigByMarathonIdAndRuleKeyQuery,
  getRulesByDomainQuery,
  getRulesByMarathonIdQuery,
  updateRuleConfigMutation,
  updateRuleConfigByMarathonIdAndRuleKeyMutation,
} from "@/db/queries/rules.queries";
import { createTRPCRouter, publicProcedure } from "../init";
import {
  createRuleConfigSchema,
  deleteRuleConfigByMarathonIdAndRuleKeySchema,
  deleteRuleConfigSchema,
  getRuleConfigByMarathonIdAndRuleKeySchema,
  getRulesByDomainSchema,
  getRulesByMarathonIdSchema,
  updateRuleConfigSchema,
  updateRuleConfigByMarathonIdAndRuleKeySchema,
} from "@/schemas/rules.schemas";

export const rulesRouter = createTRPCRouter({
  getRulesByMarathonId: publicProcedure
    .input(getRulesByMarathonIdSchema)
    .query(async ({ ctx, input }) => {
      return getRulesByMarathonIdQuery(ctx.db, {
        marathonId: input.marathonId,
      });
    }),

  getRulesByDomain: publicProcedure
    .input(getRulesByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getRulesByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),

  getRuleConfigByMarathonIdAndRuleKey: publicProcedure
    .input(getRuleConfigByMarathonIdAndRuleKeySchema)
    .query(async ({ ctx, input }) => {
      return getRuleConfigByMarathonIdAndRuleKeyQuery(ctx.db, {
        marathonId: input.marathonId,
        ruleKey: input.ruleKey,
      });
    }),

  createRuleConfig: publicProcedure
    .input(createRuleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return createRuleConfigMutation(ctx.db, {
        data: input.data,
      });
    }),

  updateRuleConfig: publicProcedure
    .input(updateRuleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return updateRuleConfigMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  updateRuleConfigByMarathonIdAndRuleKey: publicProcedure
    .input(updateRuleConfigByMarathonIdAndRuleKeySchema)
    .mutation(async ({ ctx, input }) => {
      return updateRuleConfigByMarathonIdAndRuleKeyMutation(ctx.db, {
        marathonId: input.marathonId,
        ruleKey: input.ruleKey,
        data: input.data,
      });
    }),

  deleteRuleConfig: publicProcedure
    .input(deleteRuleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteRuleConfigMutation(ctx.db, {
        id: input.id,
      });
    }),

  deleteRuleConfigByMarathonIdAndRuleKey: publicProcedure
    .input(deleteRuleConfigByMarathonIdAndRuleKeySchema)
    .mutation(async ({ ctx, input }) => {
      return deleteRuleConfigByMarathonIdAndRuleKeyMutation(ctx.db, {
        marathonId: input.marathonId,
        ruleKey: input.ruleKey,
      });
    }),
});
