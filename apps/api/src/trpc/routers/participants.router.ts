import { createTRPCRouter, publicProcedure } from "../init";

export const participantsRouter = createTRPCRouter({
  getParticipants: publicProcedure.query(async ({ ctx }) => {
    const participants = await ctx.db.query.participants.findMany();
    return participants;
  }),
});
