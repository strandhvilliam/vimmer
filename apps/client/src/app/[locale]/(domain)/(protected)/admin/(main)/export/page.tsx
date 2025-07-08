import { Suspense } from "react";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { ExportClientPage } from "./client-page";
import { ExportLoadingSkeleton } from "./_components/loading-skeleton";

export default async function ExportPage() {
  const domain = await getDomain();

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
    trpc.participants.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<ExportLoadingSkeleton />}>
        <ExportClientPage />
      </Suspense>
    </HydrateClient>
  );
}
