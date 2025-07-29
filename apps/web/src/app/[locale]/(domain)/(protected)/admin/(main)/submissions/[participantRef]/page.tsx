import { Suspense } from "react";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { ParticipantSubmissionClientPage } from "./client-page";
import { ParticipantSubmissionsSkeleton } from "@/components/admin/participant-submissions-skeleton";
import { Resource } from "sst";

interface PageProps {
  params: Promise<{
    participantRef: string;
  }>;
}

export default async function ParticipantSubmissionPage({ params }: PageProps) {
  const { participantRef } = await params;
  const domain = await getDomain();

  batchPrefetch([
    trpc.participants.getByReference.queryOptions({
      reference: participantRef,
      domain,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
    trpc.submissions.getZippedSubmissionsByParticipantRef.queryOptions({
      domain,
      participantRef,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<ParticipantSubmissionsSkeleton />}>
        <ParticipantSubmissionClientPage
          participantRef={participantRef}
          thumbnailBaseUrl={Resource.ThumbnailsRouter.url}
          submissionsBaseUrl={Resource.SubmissionsRouter.url}
        />
      </Suspense>
    </HydrateClient>
  );
}
