import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { useSuspenseQueries } from "@tanstack/react-query";

interface RequiredAction {
  action: string;
  description: string;
}

interface MarathonIsConfiguredResponse {
  isConfigured: boolean;
  requiredActions: RequiredAction[];
}

const VALIDATION_ACTIONS = {
  MISSING_DATES: "missing_dates",
  MISSING_NAME: "missing_name",
  MISSING_DEVICE_GROUPS: "missing_device_groups",
  MISSING_COMPETITION_CLASSES: "missing_competition_classes",
  MISSING_TOPICS: "missing_topics",
  INSUFFICIENT_TOPICS: "insufficient_topics",
} as const;

const VALIDATION_MESSAGES = {
  [VALIDATION_ACTIONS.MISSING_DATES]:
    "Add the start and end dates to the marathon",
  [VALIDATION_ACTIONS.MISSING_NAME]: "Add the name to the marathon",
  [VALIDATION_ACTIONS.MISSING_DEVICE_GROUPS]:
    "Add device groups to the marathon",
  [VALIDATION_ACTIONS.MISSING_COMPETITION_CLASSES]:
    "Add competition classes to the marathon",
  [VALIDATION_ACTIONS.MISSING_TOPICS]: "Add topics to the marathon",
  [VALIDATION_ACTIONS.INSUFFICIENT_TOPICS]:
    "Add more topics to match the number of photos required for each competition class",
} as const;

function createRequiredAction(
  action: keyof typeof VALIDATION_ACTIONS,
): RequiredAction {
  return {
    action: VALIDATION_ACTIONS[action],
    description: VALIDATION_MESSAGES[VALIDATION_ACTIONS[action]],
  };
}

export function useMarathonIsConfigured(): MarathonIsConfiguredResponse {
  const trpc = useTRPC();
  const { domain } = useDomain();

  const [
    { data: marathon },
    { data: deviceGroups },
    { data: competitionClasses },
    { data: topics },
  ] = useSuspenseQueries({
    queries: [
      trpc.marathons.getByDomain.queryOptions({ domain }),
      trpc.deviceGroups.getByDomain.queryOptions({ domain }),
      trpc.competitionClasses.getByDomain.queryOptions({ domain }),
      trpc.topics.getByDomain.queryOptions({ domain }),
    ],
  });

  if (!marathon?.startDate || !marathon?.endDate) {
    return {
      isConfigured: false,
      requiredActions: [createRequiredAction("MISSING_DATES")],
    };
  }

  if (!marathon?.name?.trim()) {
    return {
      isConfigured: false,
      requiredActions: [createRequiredAction("MISSING_NAME")],
    };
  }

  if (deviceGroups.length === 0) {
    return {
      isConfigured: false,
      requiredActions: [createRequiredAction("MISSING_DEVICE_GROUPS")],
    };
  }

  if (competitionClasses.length === 0) {
    return {
      isConfigured: false,
      requiredActions: [createRequiredAction("MISSING_COMPETITION_CLASSES")],
    };
  }

  if (topics.length === 0) {
    return {
      isConfigured: false,
      requiredActions: [createRequiredAction("MISSING_TOPICS")],
    };
  }

  const maxPhotosRequired = Math.max(
    ...competitionClasses.map((cc) => cc.numberOfPhotos),
  );
  if (maxPhotosRequired > topics.length) {
    return {
      isConfigured: false,
      requiredActions: [createRequiredAction("INSUFFICIENT_TOPICS")],
    };
  }

  return {
    isConfigured: true,
    requiredActions: [],
  };
}
