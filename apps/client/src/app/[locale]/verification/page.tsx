import React from "react";
import { type SearchParams } from "nuqs/server";
import {
  loadSubmissionQueryServerParams,
  submissionQueryServerParamSerializer,
} from "@/lib/schemas/submission-query-server-schema";
import { ClientVerificationPage } from "./client-page";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import { notFound, redirect } from "next/navigation";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, getQueryClient, trpc } from "@/trpc/server";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const queryClient = getQueryClient();
  const domain = await getDomain();
  const params = await loadSubmissionQueryServerParams(searchParams);

  if (!params.participantRef) notFound();

  void batchPrefetch([
    trpc.participants.getByReference.queryOptions({
      domain,
      reference: params.participantRef,
    }),
  ]);

  const participant = await queryClient.fetchQuery(
    trpc.participants.getByReference.queryOptions({
      domain,
      reference: params.participantRef,
    })
  );

  if (!participant) notFound();

  if (participant.status === "verified") {
    const redirectParams = submissionQueryServerParamSerializer(params);
    redirect(`/confirmation${redirectParams}`);
  }

  return <ClientVerificationPage />;
}
