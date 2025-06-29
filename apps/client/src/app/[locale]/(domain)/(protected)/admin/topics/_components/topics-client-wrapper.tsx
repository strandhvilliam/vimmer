"use client";

import { Topic, CompetitionClass } from "@vimmer/supabase/types";
import { updateTopicOrderAction } from "../_actions/topics-update-order-action";
import { editTopicAction } from "../_actions/topics-edit-action";
import { deleteTopicAction } from "../_actions/topics-delete-action";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { EditTopicInput } from "../_actions/topics-edit-action";
import dynamic from "next/dynamic";
import { TopicsTableSkeleton } from "./topics-table-skeleton";

// Dynamically import the DnD-dependent component
const TopicsTable = dynamic(
  () => import("./topics-table").then((mod) => mod.TopicsTable),
  {
    ssr: false,
    loading: () => <TopicsTableSkeleton />,
  }
);

interface TopicsClientWrapperProps {
  marathonId: number;
  initialTopics: Topic[];
  competitionClasses: CompetitionClass[];
}

export function TopicsClientWrapper({
  marathonId,
  initialTopics,
  competitionClasses,
}: TopicsClientWrapperProps) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);

  useEffect(() => {
    if (initialTopics) {
      setTopics(initialTopics);
    }
  }, [initialTopics]);

  const { execute: updateTopicOrder, isExecuting: isUpdatingOrder } = useAction(
    updateTopicOrderAction,
    {
      onError: (error) => {
        toast.error("Failed to update topics", {
          description: error.error.serverError,
        });
        setTopics(initialTopics);
      },
      onSuccess: () => {
        toast.success("Topics updated");
      },
    }
  );

  const { execute: updateTopic, isExecuting: isUpdatingTopic } = useAction(
    editTopicAction,
    {
      onError: (error) => {
        toast.error("Failed to update topic", {
          description: error.error.serverError,
        });
        setTopics(initialTopics);
      },
      onSuccess: () => {
        toast.success("Topic updated");
      },
    }
  );

  const { execute: deleteTopic, isExecuting: isDeletingTopic } = useAction(
    deleteTopicAction,
    {
      onError: (error) => {
        toast.error("Failed to delete topic", {
          description: error.error.serverError,
        });
        setTopics(initialTopics);
      },
      onSuccess: () => {
        toast.success("Topic deleted");
      },
    }
  );

  const handleUpdateTopicsOrder = (newOrdering: number[]) => {
    const optimisticTopics = newOrdering
      .map((topicId) => topics.find((topic) => topic.id === topicId))
      .filter((topic): topic is Topic => topic !== undefined)
      .map((topic, index) => ({
        ...topic,
        orderIndex: index,
      }));

    setTopics(optimisticTopics);

    updateTopicOrder({
      marathonId,
      topicIds: newOrdering,
    });
  };

  const handleUpdateTopic = (topic: EditTopicInput) => {
    // Optimistic update
    setTopics((currentTopics) =>
      currentTopics.map((t) =>
        t.id === topic.id
          ? {
              ...t,
              name: topic.name,
              visibility: topic.visibility,
              scheduledStart: topic.scheduledStart,
            }
          : t
      )
    );

    updateTopic(topic);
  };

  const handleDeleteTopic = (topicId: number) => {
    // Optimistic update
    setTopics((currentTopics) => currentTopics.filter((t) => t.id !== topicId));

    deleteTopic({ marathonId, topicId });
  };

  const isLoading = isUpdatingOrder || isUpdatingTopic || isDeletingTopic;

  return (
    <TopicsTable
      topics={topics}
      onUpdateTopicsOrder={handleUpdateTopicsOrder}
      onUpdateTopic={handleUpdateTopic}
      onDeleteTopic={handleDeleteTopic}
      isLoading={isLoading}
      competitionClasses={competitionClasses}
    />
  );
}
