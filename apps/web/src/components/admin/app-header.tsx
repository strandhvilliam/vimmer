"use client";

import { SidebarTriggerButton } from "./sidebar-trigger-button";
import { MarathonStatusDisplay } from "./marathon-status-display";
import { Button } from "@vimmer/ui/components/button";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Separator } from "@vimmer/ui/components/separator";
import { checkIfMarathonIsProperlyConfigured } from "@/lib/check-marathon-configuration";
import { useDomain } from "@/contexts/domain-context";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export function AppHeader() {
  const trpc = useTRPC();
  const { domain } = useDomain();

  const { data: marathon, isLoading: isMarathonLoading } = useQuery(
    trpc.marathons.getByDomain.queryOptions({ domain }),
  );
  const { data: deviceGroups, isLoading: isDeviceGroupsLoading } = useQuery(
    trpc.deviceGroups.getByDomain.queryOptions({ domain }),
  );
  const { data: competitionClasses, isLoading: isCompetitionClassesLoading } =
    useQuery(trpc.competitionClasses.getByDomain.queryOptions({ domain }));
  const { data: topics, isLoading: isTopicsLoading } = useQuery(
    trpc.topics.getByDomain.queryOptions({ domain }),
  );

  const isLoading =
    isMarathonLoading ||
    isDeviceGroupsLoading ||
    isCompetitionClassesLoading ||
    isTopicsLoading;

  let isSetupComplete = true;
  let requiredActions: Array<{ action: string; description: string }> = [];

  if (marathon && deviceGroups && competitionClasses && topics) {
    const configCheck = checkIfMarathonIsProperlyConfigured({
      marathon,
      deviceGroups,
      competitionClasses,
      topics,
    });
    isSetupComplete = configCheck.isConfigured;
    requiredActions = configCheck.requiredActions;
  }

  const staffSiteUrl = `https://${domain}.vimmer.photo/staff`;
  const participantSiteUrl = `https://${domain}.vimmer.photo`;

  return (
    <div className="z-50 w-full px-4 bg-sidebar">
      <div className="flex h-14 items-center">
        <SidebarTriggerButton />
        <div className="flex gap-2 ml-auto mr-4 border bg-sidebar-accent rounded-md items-center">
          <Button asChild variant="ghost" size="sm">
            <Link href={staffSiteUrl} className="font-normal text-sm">
              <LinkIcon className="w-4 h-4" />
              Staff Page
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4 bg-foreground" />
          <Button asChild variant="ghost" size="sm">
            <Link href={participantSiteUrl} className="font-normal text-sm">
              <LinkIcon className="w-4 h-4" />
              Participant Page
            </Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10" />
          </div>
        ) : (
          <MarathonStatusDisplay
            marathonStartDate={marathon?.startDate}
            marathonEndDate={marathon?.endDate}
            isSetupComplete={isSetupComplete}
            requiredActions={requiredActions}
          />
        )}
      </div>
    </div>
  );
}
