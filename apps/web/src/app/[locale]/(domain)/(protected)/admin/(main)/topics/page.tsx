import { Metadata } from "next";
import { Suspense } from "react";
import { TopicsClientWrapper } from "@/components/admin/topics-client-wrapper";
import { TopicsTableSkeleton } from "@/components/admin/topics-table-skeleton";
import { TopicsHeader } from "@/components/admin/topics-header";
import { HydrateClient, batchPrefetch, trpc } from "@/trpc/server";
import { getDomain } from "@/lib/get-domain";

export const metadata: Metadata = {
  title: "Topics Management",
  description:
    "Manage and organize your marathon topics, control their visibility and scheduling.",
};

export default async function TopicsPage() {
  const domain = await getDomain();
  batchPrefetch([
    // trpc.marathons.getByDomain.queryOptions({
    //   domain,
    // }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getWithSubmissionCount.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <div className="flex flex-col h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <TopicsHeader />
        </Suspense>
        <div className="flex-1">
          <div className="container h-full py-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <Suspense fallback={<TopicsTableSkeleton />}>
                  <TopicsClientWrapper />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
