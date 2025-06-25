import { TopicsHeader } from "./topics-header";
import { cookies } from "next/headers";
import { TopicsTableSkeleton } from "./topics-table-skeleton";
import { Suspense } from "react";
import { TopicsClientWrapper } from "./topics-client-wrapper";
import {
  getCompetitionClassesByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
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

  const [topics, competitionClasses] = await Promise.all([
    getTopicsByDomain(domain),
    getCompetitionClassesByDomain(domain),
  ]);

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
                  competitionClasses={competitionClasses}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
