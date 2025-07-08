"use client";

import { toast } from "sonner";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TopicsTableSkeleton } from "./topics-table-skeleton";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { Topic } from "@vimmer/api/db/types";

const TopicsTable = dynamic(
  () => import("./topics-table").then((mod) => mod.TopicsTable),
  {
    ssr: false,
    loading: () => <TopicsTableSkeleton />,
  }
);

type TopicWithSubmissionCount = Topic & {
  submissionCount: number;
};

export function TopicsClientWrapper() {
  const { domain } = useDomain();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    })
  );

  const { data: rawTopics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain,
    })
  );

  const { data: competitionClasses } = useSuspenseQuery(
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    })
  );

  const { data: topicsWithSubmissionCount } = useSuspenseQuery(
    trpc.topics.getWithSubmissionCount.queryOptions({
      domain,
    })
  );

  const initialTopics = useMemo((): TopicWithSubmissionCount[] => {
    if (!rawTopics || !topicsWithSubmissionCount) return [];

    return [...rawTopics]
      .map((topic) => ({
        ...topic,
        submissionCount:
          topicsWithSubmissionCount.find((t) => t.id === topic.id)?.count ?? 0,
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [rawTopics, topicsWithSubmissionCount]);

  const [topics, setTopics] = useState<TopicWithSubmissionCount[]>([]);

  useEffect(() => {
    if (initialTopics.length > 0) {
      setTopics(initialTopics);
    }
  }, [initialTopics]);

  const { mutate: updateTopicOrder, isPending: isUpdatingOrder } = useMutation(
    trpc.topics.updateOrder.mutationOptions({
      onError: (error) => {
        toast.error("Failed to update topics", {
          description: error.message,
        });
        setTopics(initialTopics);
      },
      onSuccess: () => {
        toast.success("Topics updated");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
      },
    })
  );

  const { mutate: updateTopic, isPending: isUpdatingTopic } = useMutation(
    trpc.topics.update.mutationOptions({
      onError: (error) => {
        toast.error("Failed to update topic", {
          description: error.message,
        });
        setTopics(initialTopics);
      },
      onSuccess: () => {
        toast.success("Topic updated");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
      },
    })
  );

  const { mutate: deleteTopic, isPending: isDeletingTopic } = useMutation(
    trpc.topics.delete.mutationOptions({
      onError: (error) => {
        toast.error("Failed to delete topic", {
          description: error.message,
        });
        setTopics(initialTopics);
      },
      onSuccess: () => {
        toast.success("Topic deleted");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
      },
    })
  );

  const handleUpdateTopicsOrder = (newOrdering: number[]) => {
    const optimisticTopics = newOrdering
      .map((topicId) => topics.find((topic) => topic.id === topicId))
      .filter((topic): topic is TopicWithSubmissionCount => topic !== undefined)
      .map((topic, index) => ({
        ...topic,
        orderIndex: index,
      }));

    setTopics(optimisticTopics);

    updateTopicOrder({
      marathonId: marathon.id,
      topicIds: newOrdering,
    });
  };

  const handleDeleteTopic = (topicId: number) => {
    setTopics((currentTopics) => currentTopics.filter((t) => t.id !== topicId));
    deleteTopic({ marathonId: marathon.id, id: topicId });
  };

  const isLoading = isUpdatingOrder || isUpdatingTopic || isDeletingTopic;

  return (
    <TopicsTable
      topics={topics}
      onUpdateTopicsOrder={handleUpdateTopicsOrder}
      onDeleteTopic={handleDeleteTopic}
      isLoading={isLoading}
      competitionClasses={competitionClasses}
    />
  );
}
