import React, { Suspense } from "react";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { RulesClientPage } from "./client-page";
import { ErrorBoundary } from "react-error-boundary";

export default async function RulesPage() {
  const domain = await getDomain();

  batchPrefetch([
    trpc.rules.getByDomain.queryOptions({
      domain,
    }),
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <RulesClientPage />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
