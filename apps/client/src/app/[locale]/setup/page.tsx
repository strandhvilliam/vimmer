import { SetupClientPage } from "./client-page";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getMarathonByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { notFound } from "next/navigation";
import { getDomain } from "@/lib/get-domain";
import { Marathon } from "@vimmer/supabase/types";
import { MarathonNotConfigured } from "@/components/marathon-not-configured";

export default async function SetupPage() {
  const domain = await getDomain();
  const marathon = await getMarathonByDomain(domain);

  if (!marathon) {
    notFound();
  }

  const data = await checkIfMarathonIsProperlyConfigured(marathon);

  if (!data.isConfigured) {
    return (
      <MarathonNotConfigured
        marathon={marathon}
        requiredActions={data.requiredActions}
      />
    );
  }

  return <SetupClientPage marathon={marathon} />;
}

async function checkIfMarathonIsProperlyConfigured(marathon: Marathon) {
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
