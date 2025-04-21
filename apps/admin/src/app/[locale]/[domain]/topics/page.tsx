import {
  getMarathonByDomain,
  getTopicsByDomain,
  getTopicsWithSubmissionCount,
} from "@vimmer/supabase/cached-queries";
import { Metadata } from "next";
import { Suspense } from "react";
import { TopicsClientWrapper } from "@/app/[locale]/[domain]/topics/_components/topics-client-wrapper";
import { TopicsTableSkeleton } from "@/app/[locale]/[domain]/topics/_components/topics-table-skeleton";
import { TopicsHeader } from "@/app/[locale]/[domain]/topics/_components/topics-header";
import { notFound } from "next/navigation";

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

  const [marathon, topics] = await Promise.all([
    getMarathonByDomain(domain),
    getTopicsByDomain(domain),
  ]);

  if (!marathon || !topics) {
    notFound();
  }

  const topicsWithSubmissionCount = await getTopicsWithSubmissionCount(
    marathon.id
  );

  console.log(topicsWithSubmissionCount);

  const sortedTopics = [...topics]
    .map((topic) => ({
      ...topic,
      submissionCount:
        topicsWithSubmissionCount.find((t) => t.id === topic.id)?.submissions[0]
          ?.count ?? 0,
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col h-full">
      <TopicsHeader marathonId={marathon.id} />
      <div className="flex-1">
        <div className="container h-full py-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Suspense fallback={<TopicsTableSkeleton />}>
                <TopicsClientWrapper
                  marathonId={marathon.id}
                  initialTopics={sortedTopics}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
