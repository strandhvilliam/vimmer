import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getMarathonByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const queryParams = request.nextUrl.searchParams;

  const domain = queryParams.get("domain");

  if (!domain) {
    return NextResponse.json({
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_domain",
          description: "Add the domain to the marathon",
        },
      ],
    });
  }

  const marathon = await getMarathonByDomain(domain);

  if (!marathon?.startDate || !marathon?.endDate) {
    return NextResponse.json({
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_dates",
          description: "Add the start and end dates to the marathon",
        },
      ],
    });
  }

  if (!marathon?.name) {
    return NextResponse.json({
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_name",
          description: "Add the name to the marathon",
        },
      ],
    });
  }

  const deviceGroups = await getDeviceGroupsByDomain(domain);

  if (deviceGroups.length === 0) {
    return NextResponse.json({
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_device_groups",
          description: "Add device groups to the marathon",
        },
      ],
    });
  }

  const competitionClasses = await getCompetitionClassesByDomain(domain);

  if (competitionClasses.length === 0) {
    return NextResponse.json({
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_competition_classes",
          description: "Add competition classes to the marathon",
        },
      ],
    });
  }

  const topics = await getTopicsByDomain(domain);

  if (topics.length === 0) {
    return NextResponse.json({
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_topics",
          description: "Add topics to the marathon",
        },
      ],
    });
  }

  if (competitionClasses.length !== topics.length) {
    return NextResponse.json({
      isConfigured: false,
      requiredActions: [
        {
          action: "missing_competition_class_topics",
          description:
            "Add topics to the competition classes to minimally match the number of competition classes",
        },
      ],
    });
  }

  return NextResponse.json({
    isConfigured: true,
    requiredActions: [],
  });
}
