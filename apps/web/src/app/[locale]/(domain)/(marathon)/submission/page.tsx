import { SubmissionClientPage } from "./client-page";
import { getDomain } from "@/lib/get-domain";
import {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  trpc,
} from "@/trpc/server";
import { Suspense } from "react";
import {
  loadSubmissionQueryServerParams,
  submissionQueryServerParamSerializer,
} from "@/lib/schemas/submission-query-server-schema";
import { SearchParams } from "nuqs/server";
import { notFound, redirect } from "next/navigation";
import { Participant } from "@vimmer/api/db/types";
import { Resource } from "sst";

interface SubmissionPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SubmissionPage({
  searchParams,
}: SubmissionPageProps) {
  const domain = await getDomain();
  const params = await loadSubmissionQueryServerParams(searchParams);
  const queryClient = getQueryClient();

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
    trpc.rules.getByDomain.queryOptions({
      domain,
    }),
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getPublicByDomain.queryOptions({
      domain,
    }),
  ]);

  if (params.participantId) {
    let participant: Participant | undefined;
    try {
      participant = await queryClient.fetchQuery(
        trpc.participants.getById.queryOptions({
          id: params.participantId,
        }),
      );
    } catch (error) {
      console.error(error);
      notFound();
    }

    if (!participant) notFound();

    if (participant.status === "completed") {
      const redirectParams = submissionQueryServerParamSerializer(params);
      redirect(`/verification${redirectParams}`);
    }

    if (participant.status === "verified") {
      const redirectParams = submissionQueryServerParamSerializer(params);
      redirect(`/confirmation${redirectParams}`);
    }
  }

  const realtimeConfig = {
    endpoint: Resource.Realtime.endpoint,
    authorizer: Resource.Realtime.authorizer,
    topic: `${Resource.App.name}/${Resource.App.stage}/submissions-status`,
  };

  return (
    <HydrateClient>
      <Suspense>
        <SubmissionClientPage realtimeConfig={realtimeConfig} />
      </Suspense>
    </HydrateClient>
  );
}
