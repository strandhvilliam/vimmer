import { createTRPCRouter } from "../init";
import { participantsRouter } from "./participants.router";
import { topicsRouter } from "./topics.router";
import { competitionClassesRouter } from "./competition-classes.router";
import { deviceGroupsRouter } from "./device-groups.router";
import { marathonsRouter } from "./marathons.router";
import { juryRouter } from "./jury.router";

export const apiRouter = createTRPCRouter({
  participants: participantsRouter,
  topics: topicsRouter,
  deviceGroups: deviceGroupsRouter,
  marathons: marathonsRouter,
  competitionClasses: competitionClassesRouter,
  jury: juryRouter,
});
