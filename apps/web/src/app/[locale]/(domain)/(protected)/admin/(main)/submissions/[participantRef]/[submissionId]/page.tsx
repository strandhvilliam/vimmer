import { Suspense } from "react";
import { batchPrefetch, trpc, HydrateClient } from "@/trpc/server";
import { SubmissionDetailClient } from "./client-page";
import { SubmissionDetailSkeleton } from "@/components/admin/submission-detail-skeleton";
import { Resource } from "sst";
import { getDomain } from "@/lib/get-domain";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{
    participantRef: string;
    submissionId: string;
  }>;
}) {
  const { participantRef, submissionId } = await params;
  const domain = await getDomain();

  batchPrefetch([
    trpc.participants.getByReference.queryOptions({
      domain,
      reference: participantRef,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <div className="container mx-auto py-8 space-y-8">
        <Suspense fallback={<SubmissionDetailSkeleton />}>
          <SubmissionDetailClient
            submissionBaseUrl={Resource.SubmissionsRouter.url}
            previewBaseUrl={Resource.PreviewsRouter.url}
            participantRef={participantRef}
            submissionId={submissionId}
          />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
