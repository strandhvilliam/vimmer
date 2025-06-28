import {
  createRuleConfigMutation,
  deleteRuleConfigByMarathonIdAndRuleKeyMutation,
  deleteRuleConfigMutation,
  getRuleConfigByMarathonIdAndRuleKeyQuery,
  getRulesByDomainQuery,
  getRulesByMarathonIdQuery,
  updateRuleConfigMutation,
  updateRuleConfigByMarathonIdAndRuleKeyMutation,
} from "@vimmer/api/db/queries/rules.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  createRuleConfigSchema,
  deleteRuleConfigByMarathonIdAndRuleKeySchema,
  deleteRuleConfigSchema,
  getRuleConfigByMarathonIdAndRuleKeySchema,
  getRulesByDomainSchema,
  getRulesByMarathonIdSchema,
  updateRuleConfigSchema,
  updateRuleConfigByMarathonIdAndRuleKeySchema,
} from "@vimmer/api/schemas/rules.schemas";

export const rulesRouter = createTRPCRouter({
  getByMarathonId: publicProcedure
    .input(getRulesByMarathonIdSchema)
    .query(async ({ ctx, input }) => {
      return getRulesByMarathonIdQuery(ctx.db, {
        marathonId: input.marathonId,
      });
    }),

  getByDomain: publicProcedure
    .input(getRulesByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getRulesByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),

  getByMarathonIdAndRuleKey: publicProcedure
    .input(getRuleConfigByMarathonIdAndRuleKeySchema)
    .query(async ({ ctx, input }) => {
      return getRuleConfigByMarathonIdAndRuleKeyQuery(ctx.db, {
        marathonId: input.marathonId,
        ruleKey: input.ruleKey,
      });
    }),

  create: publicProcedure
    .input(createRuleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return createRuleConfigMutation(ctx.db, {
        data: input.data,
      });
    }),

  update: publicProcedure
    .input(updateRuleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return updateRuleConfigMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),

  updateByMarathonIdAndRuleKey: publicProcedure
    .input(updateRuleConfigByMarathonIdAndRuleKeySchema)
    .mutation(async ({ ctx, input }) => {
      return updateRuleConfigByMarathonIdAndRuleKeyMutation(ctx.db, {
        marathonId: input.marathonId,
        ruleKey: input.ruleKey,
        data: input.data,
      });
    }),

  delete: publicProcedure
    .input(deleteRuleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteRuleConfigMutation(ctx.db, {
        id: input.id,
      });
    }),

  deleteByMarathonIdAndRuleKey: publicProcedure
    .input(deleteRuleConfigByMarathonIdAndRuleKeySchema)
    .mutation(async ({ ctx, input }) => {
      return deleteRuleConfigByMarathonIdAndRuleKeyMutation(ctx.db, {
        marathonId: input.marathonId,
        ruleKey: input.ruleKey,
      });
    }),
});
