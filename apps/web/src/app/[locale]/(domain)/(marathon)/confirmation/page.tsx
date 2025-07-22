import { SearchParams } from "nuqs/server";
import { ConfirmationClient } from "./client-page";
import { loadSubmissionQueryServerParams } from "@/lib/schemas/submission-query-server-schema";
import { notFound } from "next/navigation";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { Resource } from "sst";

interface ConfirmationPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const domain = await getDomain();
  const params = await loadSubmissionQueryServerParams(searchParams);

  if (!params.participantRef) notFound();

  batchPrefetch([
    trpc.participants.getByReference.queryOptions({
      reference: params.participantRef,
      domain,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <div className="min-h-[100dvh] bg-background">
      <HydrateClient>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[100dvh] px-4">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">
                  Loading your submission...
                </p>
              </div>
            </div>
          }
        >
          <ConfirmationClient
            participantRef={params.participantRef}
            thumbnailsBaseUrl={Resource.ThumbnailsRouter.url}
            previewsBaseUrl={Resource.PreviewsRouter.url}
          />
        </Suspense>
      </HydrateClient>
    </div>
  );
}
