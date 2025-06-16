import { createTRPCRouter } from "../init";
import { participantsRouter } from "./participants.router";

export const apiRouter = createTRPCRouter({
  participants: participantsRouter,
});
