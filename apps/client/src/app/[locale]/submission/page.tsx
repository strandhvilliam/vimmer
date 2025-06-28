import { SubmissionClientPage } from "./client-page";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

export default async function SubmissionPage() {
  const domain = await getDomain();

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
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense>
        <SubmissionClientPage />
      </Suspense>
    </HydrateClient>
  );
}
