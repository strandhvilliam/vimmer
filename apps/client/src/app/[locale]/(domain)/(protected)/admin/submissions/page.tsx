import React, { Suspense } from "react";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { SubmissionsClientPage } from "./client-page";
import { SubmissionsParticipantsTabSkeleton } from "./_components/submissions-participants-skeleton";

export default async function SubmissionsPage() {
  const domain = await getDomain();

  batchPrefetch([
    trpc.participants.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getWithSubmissionCount.queryOptions({
      domain,
    }),
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<SubmissionsParticipantsTabSkeleton />}>
        <SubmissionsClientPage />
      </Suspense>
    </HydrateClient>
  );
}
