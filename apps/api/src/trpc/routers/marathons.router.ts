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
import { RULE_KEYS } from "@vimmer/validation/constants";

export const marathonsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(getMarathonByIdSchema)
    .query(async ({ ctx, input }) => {
      return getMarathonByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getByDomain: publicProcedure
    .input(getMarathonByDomainSchema)
    .query(async ({ ctx, input }) => {
      const data = await getMarathonByDomainQuery(ctx.db, {
        domain: input.domain,
      });
      return data;
    }),
  create: publicProcedure
    .input(createMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      return createMarathonMutation(ctx.db, {
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
          (rule) => rule.ruleKey === RULE_KEYS.WITHIN_TIMERANGE
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
      return updateMarathonByDomainMutation(ctx.db, {
        domain: input.domain,
        data: input.data,
      });
    }),
  delete: publicProcedure
    .input(deleteMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteMarathonMutation(ctx.db, {
        id: input.id,
      });
    }),
  reset: publicProcedure
    .input(resetMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      return resetMarathonMutation(ctx.db, {
        id: input.id,
      });
    }),
});
