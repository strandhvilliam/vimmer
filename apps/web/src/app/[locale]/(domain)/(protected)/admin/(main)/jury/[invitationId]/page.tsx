import React, { Suspense } from "react";
import { InvitationNotFound } from "@/components/admin/invitation-not-found";
import { JuryInvitationDetails } from "@/components/admin/jury-invitation-details";
import { JuryInvitationDetailsSkeleton } from "@/components/admin/jury-invitation-details-skeleton";
import { batchPrefetch, getQueryClient, trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
import { getDomain } from "@/lib/get-domain";

export default async function JuryInvitationDetailsPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const domain = await getDomain();
  const queryClient = getQueryClient();

  batchPrefetch([
    trpc.jury.getJuryInvitationById.queryOptions({
      id: Number(invitationId),
    }),
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
  ]);

  const invitation = await queryClient.fetchQuery(
    trpc.jury.getJuryInvitationById.queryOptions({
      id: Number(invitationId),
    }),
  );

  if (!invitation) {
    return <InvitationNotFound />;
  }

  return (
    <HydrateClient>
      <Suspense fallback={<JuryInvitationDetailsSkeleton />}>
        <JuryInvitationDetails invitationId={Number(invitationId)} />
      </Suspense>
    </HydrateClient>
  );
}
