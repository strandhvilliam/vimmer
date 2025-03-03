import { createClient } from "@vimmer/supabase/server";
import { getMarathonWithConfigByDomain } from "@vimmer/supabase/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import { Plus } from "lucide-react";
import { TopicsTable } from "@/components/topics-table";

interface TopicsPageProps {
  params: Promise<{
    domain: string;
  }>;
}

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
    <div className="container py-8 flex flex-col max-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Topics</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
        </Button>
      </div>

      {/* <TopicsTable topics={sortedTopics} /> */}
    </div>
  );
}
