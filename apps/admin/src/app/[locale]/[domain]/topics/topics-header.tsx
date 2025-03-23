"use client";

import { useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import { Plus, RefreshCw } from "lucide-react";
import { TopicsCreateDialog } from "./topics-create-dialog";
import {
  createTopicAction,
  CreateTopicInput,
} from "@/app/[locale]/[domain]/topics/actions/topics-create-action";
import { Topic } from "@vimmer/supabase/types";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

interface TopicsHeaderProps {
  marathonId: number;
}

export function TopicsHeader({ marathonId }: TopicsHeaderProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { execute: createTopic, isExecuting: isCreatingTopic } = useAction(
    createTopicAction,
    {
      onError: (error) => {
        toast.error("Failed to create topic", {
          description: error.error.serverError,
        });
      },
      onSuccess: () => {
        toast.success("Topic created");
      },
    }
  );

  return (
    <div className="w-full">
      <div className="container pt-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your marathon topics. Drag topics to reorder
              them.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <PrimaryButton
              onClick={() => setCreateDialogOpen(true)}
              disabled={isCreatingTopic}
            >
              <Plus className="h-4 w-4" />
              Add Topic
            </PrimaryButton>
          </div>
        </div>
      </div>

      <TopicsCreateDialog
        marathonId={marathonId}
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={createTopic}
      />
    </div>
  );
}
