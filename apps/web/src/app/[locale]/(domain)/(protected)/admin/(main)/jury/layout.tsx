import React, { Suspense } from "react";
import { JurySidebar } from "@/components/admin/jury-sidebar";
import { JurySidebarSkeleton } from "@/components/admin/jury-sidebar-skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export default async function JuryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const domain = await getDomain();

  batchPrefetch([
    trpc.jury.getJuryInvitationsByDomain.queryOptions({
      domain,
    }),
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <div className="flex overflow-hidden h-full mx-auto">
        <Suspense fallback={<JurySidebarSkeleton />}>
          <JurySidebar />
        </Suspense>
        <div className="flex-1 flex flex-col h-full">
          <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </HydrateClient>
  );
}
