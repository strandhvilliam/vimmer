import { createTRPCRouter, publicProcedure } from "..";
import {
  createMarathonSchema,
  deleteMarathonSchema,
  getMarathonByIdSchema,
  getMarathonByDomainSchema,
  updateMarathonSchema,
  updateMarathonByDomainSchema,
} from "@vimmer/api/schemas/marathons.schemas";
import {
  createMarathonMutation,
  deleteMarathonMutation,
  getMarathonByIdQuery,
  getMarathonByDomainQuery,
  updateMarathonMutation,
  updateMarathonByDomainMutation,
} from "@vimmer/api/db/queries/marathons.queries";

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
      return updateMarathonMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
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
});
