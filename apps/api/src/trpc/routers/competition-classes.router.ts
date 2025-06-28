import { createTRPCRouter, publicProcedure } from "..";
import {
  createCompetitionClassSchema,
  deleteCompetitionClassSchema,
  getCompetitionClassByIdSchema,
  getCompetitionClassesByDomainSchema,
  updateCompetitionClassSchema,
} from "@vimmer/api/schemas/competition-classes.schemas";
import {
  createCompetitionClass,
  deleteCompetitionClass,
  getCompetitionClassByIdQuery,
  getCompetitionClassesByDomainQuery,
  updateCompetitionClass,
} from "@vimmer/api/db/queries/competition-classes.queries";

export const competitionClassesRouter = createTRPCRouter({
  getById: publicProcedure
    .input(getCompetitionClassByIdSchema)
    .query(async ({ ctx, input }) => {
      return getCompetitionClassByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getByDomain: publicProcedure
    .input(getCompetitionClassesByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getCompetitionClassesByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),
  create: publicProcedure
    .input(createCompetitionClassSchema)
    .mutation(async ({ ctx, input }) => {
      return createCompetitionClass(ctx.db, {
        data: input.data,
      });
    }),
  update: publicProcedure
    .input(updateCompetitionClassSchema)
    .mutation(async ({ ctx, input }) => {
      return updateCompetitionClass(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),
  delete: publicProcedure
    .input(deleteCompetitionClassSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteCompetitionClass(ctx.db, {
        id: input.id,
      });
    }),
});
