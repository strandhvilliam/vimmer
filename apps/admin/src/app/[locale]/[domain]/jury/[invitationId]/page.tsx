import React from "react";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getJuryInvitationById,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { InvitationDetailCard } from "../_components/invitation-detail-card";
import { InvitationOptions } from "../_components/invitation-options";
import { InvitationNotFound } from "../_components/invitation-not-found";

export default async function JuryInvitationDetailsPage({
  params,
}: {
  params: Promise<{ domain: string; invitationId: string }>;
}) {
  const { domain, invitationId } = await params;

  const [invitation, competitionClasses, topics, deviceGroups] =
    await Promise.all([
      getJuryInvitationById(Number(invitationId)),
      getCompetitionClassesByDomain(domain),
      getTopicsByDomain(domain),
      getDeviceGroupsByDomain(domain),
    ]);

  if (!invitation) {
    return <InvitationNotFound />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Jury Invitation</h1>
        <InvitationOptions
          invitationId={Number(invitationId)}
          email={invitation.email}
        />
      </div>

      <InvitationDetailCard
        invitation={invitation}
        competitionClasses={competitionClasses}
        topics={topics}
        deviceGroups={deviceGroups}
      />
    </div>
  );
}
