import { SearchParams } from "nuqs/server";
import { ConfirmationClient } from "./client-page";
import { loadSubmissionQueryServerParams } from "@/lib/schemas/submission-query-server-schema";
import { notFound } from "next/navigation";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { Resource } from "sst";
import { getI18n } from "@/locales/server";
import { LoadingLogo } from "@/components/loading-logo";
import { connection } from "next/server";

interface ConfirmationPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  await connection();
  const domain = await getDomain();
  const params = await loadSubmissionQueryServerParams(searchParams);

  if (!params.participantRef) notFound();

  batchPrefetch([
    trpc.participants.getByReference.queryOptions({
      reference: params.participantRef,
      domain,
    }),
    trpc.topics.getPublicByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLogo />}>
        <ConfirmationClient
          participantRef={params.participantRef}
          thumbnailsBaseUrl={Resource.ThumbnailsRouter.url}
          previewsBaseUrl={Resource.PreviewsRouter.url}
        />
      </Suspense>
    </HydrateClient>
  );
}
