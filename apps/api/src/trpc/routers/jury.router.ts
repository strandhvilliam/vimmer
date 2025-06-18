import {
  getJuryInvitationsByMarathonIdQuery,
  getJurySubmissionsQuery,
} from "@/db/queries/jury.queries";
import { createTRPCRouter, publicProcedure } from "../init";
import {
  getJuryInvitationsByMarathonIdSchema,
  getJurySubmissionsSchema,
} from "@/schemas/jury.schemas";

export const juryRouter = createTRPCRouter({
  getJurySubmissions: publicProcedure
    .input(getJurySubmissionsSchema)
    .query(async ({ ctx, input }) => {
      return getJurySubmissionsQuery(ctx.db, input);
    }),
  getJuryInvitationsByMarathonId: publicProcedure
    .input(getJuryInvitationsByMarathonIdSchema)
    .query(async ({ ctx, input }) => {
      return getJuryInvitationsByMarathonIdQuery(ctx.db, input);
    }),
});
