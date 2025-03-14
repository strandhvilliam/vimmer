import {
  getMarathonByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { TopicsWrapper } from "@/components/topics/topics-wrapper";
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
  const { domain } = await params;
  const marathon = await getMarathonByDomain(domain);
  const topics = await getTopicsByDomain(domain);

  if (!topics || !marathon) {
    return <div>Topics not found</div>;
  }

  const sortedTopics = [...topics].sort((a, b) => a.orderIndex - b.orderIndex);

  return <TopicsWrapper marathonId={marathon.id} topics={sortedTopics} />;
}
