import { createClient } from "@vimmer/supabase/server";
import { TopicsWrapper } from "./topics-wrapper";
import { TopicsHeader } from "./topics-header";
import { getTopicsByDomainQuery } from "@vimmer/supabase/queries";
import { cookies } from "next/headers";
import { TopicsTableSkeleton } from "./topics-table-skeleton";
import { Suspense } from "react";
import { TopicsClientWrapper } from "./topics-client-wrapper";
import { getTopicsByDomain } from "@vimmer/supabase/cached-queries";
import { notFound } from "next/navigation";
interface TopicsPageProps {
  marathonId: number;
}

export async function TopicsPage({ marathonId }: TopicsPageProps) {
  const cookieStore = await cookies();
  const domain = cookieStore.get("activeDomain")?.value;

  if (!domain) {
    notFound();
  }

  const topics = await getTopicsByDomain(domain);

  const sortedTopics = [...topics].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col h-full">
      <TopicsHeader marathonId={marathonId} />
      <div className="flex-1">
        <div className="container h-full py-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Suspense fallback={<TopicsTableSkeleton />}>
                <TopicsClientWrapper
                  marathonId={marathonId}
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
