"use client";

import { Topic } from "@vimmer/supabase/types";
import { TopicsHeader } from "./topics-header";
import { updateTopicOrder } from "../../lib/actions/topics-update-order-action";
import { editTopicAction } from "../../lib/actions/topics-edit-action";
import { toast, useToast } from "@vimmer/ui/hooks/use-toast";
import { useAction } from "next-safe-action/hooks";

import dynamic from "next/dynamic";
import { TopicsTableSkeleton } from "./topics-table-skeleton";

const TopicsTable = dynamic(
  () => import("./topics-table").then((mod) => mod.TopicsTable),
  {
    ssr: false,
    loading: () => <TopicsTableSkeleton />,
  }
);

interface TopicsWrapperProps {
  marathonId: number;
  topics: Topic[];
}

export function TopicsWrapper({ marathonId, topics }: TopicsWrapperProps) {
  const { execute: updateTopicOrderAction, isExecuting: isUpdatingOrder } =
    useAction(updateTopicOrder, {
      onError: (error) => {
        toast({
          title: "Failed to update topics",
          description: error.error.serverError,
        });
      },
      onSuccess: () => {
        toast({
          title: "Topics updated",
        });
      },
    });

  const { execute: updateTopicAction, isExecuting: isUpdatingTopic } =
    useAction(editTopicAction, {
      onError: (error) => {
        toast({
          title: "Failed to update topic",
          description: error.error.serverError,
        });
      },
      onSuccess: () => {
        toast({
          title: "Topic updated",
        });
      },
    });

  const handleUpdateTopicsOrder = (newOrdering: number[]) => {
    updateTopicOrderAction({
      marathonId,
      topicIds: newOrdering,
    });
  };

  const handleUpdateTopic = (topic: Topic) => {
    updateTopicAction({
      id: topic.id,
      name: topic.name,
      scheduledStart: topic.scheduledStart,
      visibility: topic.visibility as "public" | "private",
      marathonId,
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <TopicsHeader marathonId={marathonId} />
      <div className="flex-1">
        <div className="container h-full py-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <TopicsTable
                topics={topics}
                onUpdateTopicsOrder={handleUpdateTopicsOrder}
                onUpdateTopic={handleUpdateTopic}
                isLoading={isUpdatingOrder || isUpdatingTopic}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
