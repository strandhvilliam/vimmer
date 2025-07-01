import {
  createRuleConfigMutation,
  deleteRuleConfigMutation,
  getRulesByDomainQuery,
  updateMultipleRuleConfigMutation,
  updateRuleConfigMutation,
} from "@vimmer/api/db/queries/rules.queries";
import { createTRPCRouter, publicProcedure } from "..";
import {
  createRuleConfigSchema,
  deleteRuleConfigSchema,
  getRulesByDomainSchema,
  updateRuleConfigSchema,
  updateMultipleRuleConfigSchema,
} from "@vimmer/api/schemas/rules.schemas";
import type { NewRuleConfig } from "@vimmer/api/db/types";

export const rulesRouter = createTRPCRouter({
  getByDomain: publicProcedure
    .input(getRulesByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getRulesByDomainQuery(ctx.db, {
        domain: input.domain,
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

  updateMultiple: publicProcedure
    .input(updateMultipleRuleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const rules = await getRulesByDomainQuery(ctx.db, {
        domain: input.domain,
      });

      const rulesToUpdate = rules.reduce((acc, rule) => {
        const ruleToUpdate = input.data.find(
          (item) => item.ruleKey === rule.ruleKey
        );
        if (ruleToUpdate) {
          acc.push({
            ...rule,
            ...ruleToUpdate,
          });
        }
        return acc;
      }, [] as NewRuleConfig[]);

      return updateMultipleRuleConfigMutation(ctx.db, {
        data: rulesToUpdate,
      });
    }),

  delete: publicProcedure
    .input(deleteRuleConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteRuleConfigMutation(ctx.db, {
        id: input.id,
      });
    }),
});
