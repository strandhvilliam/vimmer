import React from "react";
import { type SearchParams } from "nuqs/server";
import {
  loadSubmissionQueryServerParams,
  submissionQueryServerParamSerializer,
} from "@/lib/schemas/submission-query-server-schema";
import { ClientVerificationPage } from "./client-page";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import { notFound, redirect } from "next/navigation";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const domain = "dev0";
  const params = await loadSubmissionQueryServerParams(searchParams);

  if (!params.participantRef) notFound();
  const participant = await getParticipantByReference(
    domain,
    params.participantRef
  );
  if (!participant) notFound();

  if (participant.status === "verified") {
    const redirectParams = submissionQueryServerParamSerializer(params);
    redirect(`/confirmation${redirectParams}`);
  }

  const qrCodeValue = `${domain}-${params.participantId}-${params.participantRef}`;
  return <ClientVerificationPage qrCodeValue={qrCodeValue} />;
}
