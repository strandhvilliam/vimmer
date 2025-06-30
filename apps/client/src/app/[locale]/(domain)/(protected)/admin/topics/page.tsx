import { Metadata } from "next";
import { Suspense } from "react";
import { TopicsClientWrapper } from "./_components/topics-client-wrapper";
import { TopicsTableSkeleton } from "./_components/topics-table-skeleton";
import { TopicsHeader } from "./_components/topics-header";
import {
  HydrateClient,
  batchPrefetch,
  trpc,
  createServerApiClient,
} from "@/trpc/server";

interface TopicsPageProps {
  params: Promise<{
    domain: string;
  }>;
}

export const metadata: Metadata = {
  title: "Topics Management",
  description:
    "Manage and organize your marathon topics, control their visibility and scheduling.",
};

export default async function TopicsPage({ params }: TopicsPageProps) {
  const { domain } = await params;

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
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
          <TopicsHeader domain={domain} />
        </Suspense>
        <div className="flex-1">
          <div className="container h-full py-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <Suspense fallback={<TopicsTableSkeleton />}>
                  <TopicsClientWrapper domain={domain} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
