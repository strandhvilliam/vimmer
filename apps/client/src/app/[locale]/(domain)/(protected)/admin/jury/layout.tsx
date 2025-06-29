import React, { Suspense } from "react";
import { JuryInvitationsList } from "./_components/jury-invitations-list";
import { JuryInvitationsListSkeleton } from "./_components/jury-invitations-list-skeleton";
import { CreateInvitationButton } from "./_components/create-invitation-button";
import { ErrorBoundary } from "react-error-boundary";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getJuryInvitationsByDomain,
  getMarathonByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";

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

  const invitationsPromise = getJuryInvitationsByDomain(domain);
  const competitionClassesPromise = getCompetitionClassesByDomain(domain);
  const topicsPromise = getTopicsByDomain(domain);
  const marathonPromise = getMarathonByDomain(domain);
  const deviceGroupsPromise = getDeviceGroupsByDomain(domain);

  return (
    <div className="flex overflow-hidden h-full mx-auto">
      <div className="w-80 border-r flex flex-col bg-background">
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
