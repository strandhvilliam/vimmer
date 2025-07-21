import { SearchParams } from "nuqs/server";
import { ConfirmationClient } from "./client-page";
import { loadSubmissionQueryServerParams } from "@/lib/schemas/submission-query-server-schema";
import { notFound } from "next/navigation";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

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
    <div className="min-h-[100dvh]">
      <HydrateClient>
        <Suspense fallback={<div>Loading...</div>}>
          <ConfirmationClient participantRef={params.participantRef} />
        </Suspense>
      </HydrateClient>
    </div>
  );
}
