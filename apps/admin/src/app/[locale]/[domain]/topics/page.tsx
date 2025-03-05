import { createClient } from "@vimmer/supabase/server";
import { getMarathonWithConfigByDomain } from "@vimmer/supabase/queries";
import { TopicsWrapper } from "@/components/topics-wrapper";
import { Metadata } from "next";

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
  const supabase = await createClient();
  const { domain } = await params;
  const marathon = await getMarathonWithConfigByDomain(supabase, domain);

  if (!marathon) {
    return <div>Marathon not found</div>;
  }

  const sortedTopics = [...marathon.topics].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  return (
    <div className="flex flex-col h-screen">
      <TopicsWrapper
        initialTopics={sortedTopics}
        marathonId={marathon.id.toString()}
      />
    </div>
  );
}
