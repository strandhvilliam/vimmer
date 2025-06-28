import { participantsRouter } from "./participants.router";
import { topicsRouter } from "./topics.router";
import { competitionClassesRouter } from "./competition-classes.router";
import { deviceGroupsRouter } from "./device-groups.router";
import { marathonsRouter } from "./marathons.router";
import { juryRouter } from "./jury.router";
import { usersRouter } from "./users.router";
import { rulesRouter } from "./rules.router";
import { submissionsRouter } from "./submissions.router";
import { verificationsRouter } from "./verifications.router";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "..";

export const appRouter = createTRPCRouter({
  participants: participantsRouter,
  topics: topicsRouter,
  deviceGroups: deviceGroupsRouter,
  marathons: marathonsRouter,
  competitionClasses: competitionClassesRouter,
  jury: juryRouter,
  users: usersRouter,
  rules: rulesRouter,
  submissions: submissionsRouter,
  verifications: verificationsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
