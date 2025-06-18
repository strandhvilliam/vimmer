import { createTRPCRouter, publicProcedure } from "../init";
import {
  createCompetitionClassSchema,
  deleteCompetitionClassSchema,
  getCompetitionClassByIdSchema,
  getCompetitionClassesByDomainSchema,
  updateCompetitionClassSchema,
} from "@/schemas/competition-classes.schemas";
import {
  createCompetitionClass,
  deleteCompetitionClass,
  getCompetitionClassByIdQuery,
  getCompetitionClassesByDomainQuery,
  updateCompetitionClass,
} from "@/db/queries/competition-classes.queries";

export const competitionClassesRouter = createTRPCRouter({
  getCompetitionClassById: publicProcedure
    .input(getCompetitionClassByIdSchema)
    .query(async ({ ctx, input }) => {
      return getCompetitionClassByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getCompetitionClassesByDomain: publicProcedure
    .input(getCompetitionClassesByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getCompetitionClassesByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),
  createCompetitionClass: publicProcedure
    .input(createCompetitionClassSchema)
    .mutation(async ({ ctx, input }) => {
      return createCompetitionClass(ctx.db, {
        data: input.data,
      });
    }),
  updateCompetitionClass: publicProcedure
    .input(updateCompetitionClassSchema)
    .mutation(async ({ ctx, input }) => {
      return updateCompetitionClass(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),
  deleteCompetitionClass: publicProcedure
    .input(deleteCompetitionClassSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteCompetitionClass(ctx.db, {
        id: input.id,
      });
    }),
});
