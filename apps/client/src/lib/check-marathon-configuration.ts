import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { Marathon } from "@vimmer/supabase/types";

interface RequiredAction {
  action: string;
  description: string;
}

interface ConfigurationCheck {
  isConfigured: boolean;
  requiredActions: RequiredAction[];
}

export async function checkIfMarathonIsProperlyConfigured(
  marathon: Marathon
): Promise<ConfigurationCheck> {
  if (!marathon?.startDate || !marathon?.endDate) {
    return {
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_dates",
          description: "Add the start and end dates to the marathon",
        },
      ],
    };
  }

  if (!marathon?.name) {
    return {
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_name",
          description: "Add the name to the marathon",
        },
      ],
    };
  }

  const deviceGroups = await getDeviceGroupsByDomain(marathon.domain);

  if (deviceGroups.length === 0) {
    return {
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_device_groups",
          description: "Add device groups to the marathon",
        },
      ],
    };
  }

  const competitionClasses = await getCompetitionClassesByDomain(
    marathon.domain
  );

  if (competitionClasses.length === 0) {
    return {
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_competition_classes",
          description: "Add competition classes to the marathon",
        },
      ],
    };
  }

  const topics = await getTopicsByDomain(marathon.domain);

  if (topics.length === 0) {
    return {
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_topics",
          description: "Add topics to the marathon",
        },
      ],
    };
  }

  console.log(
    "competitionClasses",
    JSON.stringify(competitionClasses, null, 2)
  );
  console.log("topics", topics.length);
  if (
    competitionClasses.some(
      (competitionClass) => competitionClass.numberOfPhotos > topics.length
    )
  ) {
    return {
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_competition_class_topics",
          description:
            "Add topics to the competition classes to minimally match the number of photos required for each competition class",
        },
      ],
    };
  }

  return {
    isConfigured: true,
    requiredActions: [],
  };
}
