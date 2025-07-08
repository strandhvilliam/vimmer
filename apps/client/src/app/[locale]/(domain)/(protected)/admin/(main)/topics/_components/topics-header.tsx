"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TopicsCreateDialog } from "./topics-create-dialog";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";

export function TopicsHeader() {
  const { domain } = useDomain();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    })
  );

  // const { execute: createTopic, isExecuting: isCreatingTopic } = useAction(
  //   createTopicAction,
  //   {
  //     onError: (error) => {
  //       if (typeof error.error.serverError === "string") {
  //         toast.error("Failed to create topic", {
  //           description: error.error.serverError,
  //         });
  //       }
  //     },
  //     onSuccess: () => {
  //       toast.success("Topic created");
  //     },
  //     onSettled: () => {
  //       queryClient.invalidateQueries({
  //         queryKey: trpc.topics.pathKey(),
  //       });
  //     },
  //   }
  // );

  return (
    <div className="w-full">
      <div className="container pt-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
              Topics
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your marathon topics. Drag topics to reorder
              them.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <PrimaryButton onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Topic
            </PrimaryButton>
          </div>
        </div>
      </div>

      <TopicsCreateDialog
        marathonId={marathon.id}
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
