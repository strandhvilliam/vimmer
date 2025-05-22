import React, { Suspense } from "react";
import { Search, Send } from "lucide-react";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import { Input } from "@vimmer/ui/components/input";
import { JuryInvitationsList } from "./_components/jury-invitations-list";
import { JuryInvitationsListSkeleton } from "./_components/jury-invitations-list-skeleton";
import { CreateInvitationButton } from "./_components/create-invitation-button";
import { ErrorBoundary } from "react-error-boundary";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getJuryInvitationsByMarathonId,
  getMarathonByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";

// This would be replaced with actual data fetching
async function getJuryInvitations(marathonId: number) {
  try {
    return await getJuryInvitationsByMarathonId(marathonId);
  } catch (error) {
    console.error("Failed to load jury invitations:", error);
    return [];
  }
}

export default async function JuryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    domain: string;
    invitationId?: string;
  }>;
}) {
  const { domain } = await params;
  const marathonId = 1; // In a real implementation, this would be fetched based on the domain
  const invitationsPromise = getJuryInvitations(marathonId);
  const competitionClassesPromise = getCompetitionClassesByDomain(domain);
  const topicsPromise = getTopicsByDomain(domain);
  const marathonPromise = getMarathonByDomain(domain);
  const deviceGroupsPromise = getDeviceGroupsByDomain(domain);

  return (
    <div className="flex overflow-hidden h-full mx-auto">
      <div className="w-80 border-r flex flex-col">
        <div className="pt-4 space-y-4 bg-background">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-semibold font-rocgrotesk">
              Jury Invitations
            </h2>
            <CreateInvitationButton
              marathonPromise={marathonPromise}
              competitionClassesPromise={competitionClassesPromise}
              topicsPromise={topicsPromise}
              deviceGroupsPromise={deviceGroupsPromise}
            />
          </div>
          <Suspense fallback={<JuryInvitationsListSkeleton />}>
            <JuryInvitationsList
              domain={domain}
              invitationsPromise={invitationsPromise}
            />
          </Suspense>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full">
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
