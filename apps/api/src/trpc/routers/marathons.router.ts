import { createTRPCRouter, publicProcedure } from "../init";
import {
  createMarathonSchema,
  deleteMarathonSchema,
  getMarathonByIdSchema,
  getMarathonByDomainSchema,
  updateMarathonSchema,
} from "@/schemas/marathons.schemas";
import {
  createMarathonMutation,
  deleteMarathonMutation,
  getMarathonByIdQuery,
  getMarathonByDomainQuery,
  updateMarathonMutation,
} from "@/db/queries/marathons.queries";

export const marathonsRouter = createTRPCRouter({
  getMarathonById: publicProcedure
    .input(getMarathonByIdSchema)
    .query(async ({ ctx, input }) => {
      return getMarathonByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getMarathonByDomain: publicProcedure
    .input(getMarathonByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getMarathonByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),
  createMarathon: publicProcedure
    .input(createMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      return createMarathonMutation(ctx.db, {
        data: input.data,
      });
    }),
  updateMarathon: publicProcedure
    .input(updateMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      return updateMarathonMutation(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),
  deleteMarathon: publicProcedure
    .input(deleteMarathonSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteMarathonMutation(ctx.db, {
        id: input.id,
      });
    }),
});
